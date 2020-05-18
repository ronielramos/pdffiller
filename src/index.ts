/* eslint-disable camelcase */
/*
*   File:       index.js (pdffiller)
*   Project:    PDF Filler
*   Date:       May 2015.
*
*   Description: This PDF filler module takes a data set and creates a filled out
*                PDF file with the form fields populated.
*/

import { exec } from 'child_process'

// generate_fdf
// fill_form < FDF data filename | XFDF data filename | - | PROMPT >
// pdftk form.pdf fill_form data.fdf output form.filled.pdf

class Pdffiller {
  constructor (private execProcess = exec) {
    console.log('init')
  }

  public convFieldJson2FDF (fieldJson: { [key: string]: unknown }) {
    const jsonObj: { [key: string]: string | number } = {}

    Object
      .entries(fieldJson)
      .map(([key, value]) => {
        if (value == null) return [key, '']
        if (value === true) return [key, 'Yes']
        if (value === false) return [key, 'Off']
        if (typeof value === 'number' || typeof value === 'string') return [key, value]
        throw new Error(`Value ${value} of type ${typeof value} is invalid`)
      })
      .forEach(([key, value]) => {
        jsonObj[key] = value
      })

    return jsonObj
  }

  public fillForm (sourceFile: string, destinationFile: string, fieldValues: object, callback: Function) {
  }
}

export default new Pdffiller()
