/*
*   File:       index.js (pdffiller)
*   Project:    PDF Filler
*   Date:       May 2015.
*
*   Description: This PDF filler module takes a data set and creates a filled out
*                PDF file with the form fields populated.
*/

  import child_process from 'child_process'
  import fs from 'fs'
  import _ from 'lodash'

  class pdffiller {

    constructor(private execFile = child_process.execFile) {

    }

    public mapForm2PDF (formFields: { [key: string]: unknown }, convMap: { [key: string]: unknown }) {
      const tmpFDFData = this.convFieldJson2FDF(formFields);
      const tmpFDFData2 = _.mapKeys(tmpFDFData, function (value: unknown, key: string) {
        try {
          convMap[key];
        } catch (err) {

          return key;
        }
        return convMap[key]
      });

      return tmpFDFData2
    }

    public convFieldJson2FDF (fieldJson: { [key: string]: unknown }) {
      const _keys = _.map(fieldJson, 'title')
      const _values = _.map(fieldJson, 'fieldValue')

      const _values2 = _.map(_values, function (val: boolean) {
        if (val === true) {
          return 'Yes';
        } else if (val === false) {
          return 'Off';
        }
        return val;
      });

      const jsonObj = _.zipObject(_keys, _values2);

      return jsonObj
    }

    public generateFieldJson (sourceFile: string, nameRegex: string, callback: Function) {
      const regName: string | RegExp = (nameRegex !== null && (typeof nameRegex) == 'object') 
        ? nameRegex 
        : /FieldName: ([^\n]*)/

      const regType = /FieldType: ([A-Za-z\t .]+)/
      const regFlags = /FieldFlags: ([0-9\t .]+)/
      const fieldArray: { [key: string]: string }[] = []


      this.execFile("pdftk", [sourceFile, "dump_data_fields_utf8"], function (error: Error, stdout: object, stderr: object) {
        if (error) {
          console.log('exec error: ' + error);
          return callback(error, null);
        }

        const fields = stdout.toString().split("---").slice(1);
        fields.forEach(function (field: string) {
          const currField: { [key: string]: string } = {}

          currField['title'] = (field.match(regName) || '')[1]?.trim() || ''

          if (field.match(regType)) currField['fieldType'] = (field.match(regType) || '')[1]?.trim() || ''
          else currField['fieldType'] = ''

          if (field.match(regFlags)) currField['fieldFlags'] = (field.match(regFlags) || '')[1]?.trim() || ''
          else currField['fieldFlags'] = ''

          currField['fieldValue'] = ''

          fieldArray.push(currField)
        })

        return callback(null, fieldArray);
      });
    }

    public generateFDFTemplate (sourceFile: string, nameRegex: string, callback: Function) {
      this.generateFieldJson(sourceFile, nameRegex, function (err: Error, _form_fields: object) {
        if (err) {
          console.log('exec error: ' + err);
          return callback(err, null);
        }

        return callback(null, this.convFieldJson2FDF(_form_fields));

      })
    }

    public fillFormWithOptions (sourceFile: string, destinationFile: string, fieldValues: object, shouldFlatten: boolean, tempFDFPath: string | undefined, callback: Function) {


      //Generate the data from the field values.
      var randomSequence = Math.random().toString(36).substring(7);
      var currentTime = new Date().getTime();
      var tempFDFFile = "temp_data" + currentTime + randomSequence + ".fdf",
        tempFDF = (typeof tempFDFPath !== "undefined" ? tempFDFPath + '/' + tempFDFFile : tempFDFFile),

        formData = fdf.generator(fieldValues, tempFDF);

      var args = [sourceFile, "fill_form", tempFDF, "output", destinationFile];
      if (shouldFlatten) {
        args.push("flatten");
      }
      this.execFile("pdftk", args, function (error: Error, stdout: object, stderr: object) {

        if (error) {
          console.log('exec error: ' + error);
          return callback(error);
        }
        //Delete the temporary fdf file.
        fs.unlink(tempFDF, function (err: Error) {

          if (err) {
            return callback(err);
          }
          // console.log( 'Sucessfully deleted temp file ' + tempFDF );
          return callback();
        });
      });
    }

    public fillFormWithFlatten (sourceFile: string, destinationFile: string, fieldValues: object, shouldFlatten: boolean, callback: Function) {
      this.fillFormWithOptions(sourceFile, destinationFile, fieldValues, shouldFlatten, undefined, callback);
    }

    public fillForm (sourceFile: string, destinationFile: string, fieldValues: object, callback: Function) {
      this.fillFormWithFlatten(sourceFile, destinationFile, fieldValues, true, callback);
    }

  }

  
export default new pdffiller()


