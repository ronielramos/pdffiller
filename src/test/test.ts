/* eslint-disable handle-callback-err */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/*
*   File:       pdf.js
*   Project:    PDF Filler
*   Date:       June 2015.
*
*/

import pdfFiller from '../index'
import expected from './expected_data'
import { expect } from 'chai'

const dest2PDF = 'test/test_complete2.pdf'
const source2PDF = 'test/test.pdf'
const dest1PDF = 'test/test_complete1.pdf'
const source1PDF = 'test/test1.pdf'

/**
 * Unit tests
 */
describe('pdfFiller Tests', function () {
  describe('fillForm()', function () {
    const _data = {
      first_name: 'John',
      last_name: 'Doe',
      date: 'Jan 1, 2013',
      football: 'Off',
      baseball: 'Yes',
      basketball: 'Off',
      hockey: 'Yes',
      nascar: 'Off'
    }

    it('should not throw an error when creating test_complete.pdf from test.pdf with filled data', function (done) {
      this.timeout(15000)
      pdfFiller.fillForm(source2PDF, dest2PDF, _data, function (err: Error | null) {
        expect(err).to.be.null
        done()
      })
    })

    it('should create an completely filled PDF that is read-only', function (done) {
      this.timeout(15000)
      pdfFiller.fillFormWithFlatten(source2PDF, dest2PDF, _data, true, function (err) {
        pdfFiller.generateFieldJson(dest2PDF, null, function (err, fdfData) {
          expect(err).to.be.null
          expect(fdfData).have.lengthOf(0)
          done()
        })
      })
    })

    it('should create an completely filled PDF that is read-only and with an specific temporary folder for FDF files', function (done) {
      this.timeout(15000)
      pdfFiller.fillFormWithOptions(source2PDF, dest2PDF, _data, true, './', function (err) {
        pdfFiller.generateFieldJson(dest2PDF, null, function (err, fdfData) {
          expect(fdfData).have.lengthOf(0)
          done()
        })
      })
    })

    it('should create an unflattened PDF with unfilled fields remaining', function (done) {
      this.timeout(15000)
      const source3PDF = source2PDF
      const dest3PDF = 'test/test_complete3.pdf'
      const _data2 = {
        first_name: 'Jerry'
      }
      pdfFiller.fillFormWithFlatten(source3PDF, dest3PDF, _data2, false, function (err) {
        pdfFiller.generateFieldJson(dest3PDF, null, function (err, fdfData) {
          expect(fdfData).have.not.lengthOf(0)
          done()
        })
      })
    })
  })

  describe('generateFieldJson()', function () {
    const _expected = [
      {
        fieldFlags: '0',
        title: 'first_name',
        fieldValue: '',
        fieldType: 'Text'
      },
      {
        fieldFlags: '0',
        title: 'last_name',
        fieldValue: '',
        fieldType: 'Text'
      },
      {
        fieldFlags: '0',
        title: 'date',
        fieldValue: '',
        fieldType: 'Text'
      },
      {
        fieldFlags: '0',
        title: 'football',
        fieldValue: '',
        fieldType: 'Button'
      },
      {
        fieldFlags: '0',
        title: 'baseball',
        fieldValue: '',
        fieldType: 'Button'
      },
      {
        fieldFlags: '0',
        title: 'basketball',
        fieldValue: '',
        fieldType: 'Button'
      },
      {
        fieldFlags: '0',
        title: 'nascar',
        fieldValue: '',
        fieldType: 'Button'
      },
      {
        fieldFlags: '0',
        title: 'hockey',
        fieldValue: '',
        fieldType: 'Button'
      }
    ]

    it('should generate form field JSON as expected', function (done) {
      this.timeout(15000)
      pdfFiller.generateFieldJson(source2PDF, null, function (err, form_fields) {
        expect(err).to.be.null
        expect(form_fields).to.be.deep.equal(_expected)
        done()
      })
    })

    it('should generate another form field JSON with no errors', function (done) {
      this.timeout(15000)
      pdfFiller.generateFieldJson(source1PDF, null, function (err, form_fields) {
        expect(err).to.be.null
        expect(form_fields).to.be.deep.equal(expected.test1.form_fields)
        done()
      })
    })
  })

  describe('generateFDFTemplate()', function () {
    const _expected = {
      last_name: '',
      first_name: '',
      date: '',
      football: '',
      baseball: '',
      basketball: '',
      hockey: '',
      nascar: ''
    }

    it('should generate a FDF Template as expected', function (done) {
      this.timeout(15000)
      pdfFiller.generateFDFTemplate(source2PDF, null, function (err, fdfTemplate) {
        expect(err).to.be.null
        expect(fdfTemplate).to.be.deep.equal(_expected)
        done()
      })
    })

    it('should generate another FDF Template with no errors', function (done) {
      this.timeout(15000)
      pdfFiller.generateFDFTemplate(source1PDF, null, function (err, fdfTemplate) {
        expect(err).to.be.null
        expect(fdfTemplate).to.be.deep.equal(expected.test1.fdfTemplate)
        done()
      })
    })
  })

  describe('convFieldJson2FDF()', function () {
    const _expected = {
      first_name: 'John',
      last_name: 'Doe',
      date: 'Jan 1, 2013',
      football: 'Off',
      baseball: 'Yes',
      basketball: 'Off',
      hockey: 'Yes',
      nascar: 'Off'
    }

    const _data = [
      {
        title: 'first_name',
        fieldfieldType: 'Text',
        fieldValue: 'John'
      },
      {
        title: 'last_name',
        fieldfieldType: 'Text',
        fieldValue: 'Doe'
      },
      {
        title: 'date',
        fieldType: 'Text',
        fieldValue: 'Jan 1, 2013'
      },
      {
        title: 'football',
        fieldType: 'Button',
        fieldValue: false
      },
      {
        title: 'baseball',
        fieldType: 'Button',
        fieldValue: true
      },
      {
        title: 'basketball',
        fieldType: 'Button',
        fieldValue: false
      },
      {
        title: 'hockey',
        fieldType: 'Button',
        fieldValue: true
      },
      {
        title: 'nascar',
        fieldType: 'Button',
        fieldValue: false
      }
    ]

    it('Should generate an corresponding FDF object', function (done) {
      const FDFData = pdfFiller.convFieldJson2FDF(_data)
      expect(FDFData).to.be.deep.equal(_expected)
      done()
    })
  })

  describe('mapForm2PDF()', function () {
    const _convMap = {
      lastName: 'last_name',
      firstName: 'first_name',
      Date: 'date',
      footballField: 'football',
      baseballField: 'baseball',
      bballField: 'basketball',
      hockeyField: 'hockey',
      nascarField: 'nascar'
    }

    const _data = [
      {
        title: 'lastName',
        fieldfieldType: 'Text',
        fieldValue: 'John'
      },
      {
        title: 'firstName',
        fieldfieldType: 'Text',
        fieldValue: 'Doe'
      },
      {
        title: 'Date',
        fieldType: 'Text',
        fieldValue: 'Jan 1, 2013'
      },
      {
        title: 'footballField',
        fieldType: 'Button',
        fieldValue: false
      },
      {
        title: 'baseballField',
        fieldType: 'Button',
        fieldValue: true
      },
      {
        title: 'bballField',
        fieldType: 'Button',
        fieldValue: false
      },
      {
        title: 'hockeyField',
        fieldType: 'Button',
        fieldValue: true
      },
      {
        title: 'nascarField',
        fieldType: 'Button',
        fieldValue: false
      }
    ]

    const _expected = {
      last_name: 'John',
      first_name: 'Doe',
      date: 'Jan 1, 2013',
      football: 'Off',
      baseball: 'Yes',
      basketball: 'Off',
      hockey: 'Yes',
      nascar: 'Off'
    }

    it('Should convert formJson to FDF data as expected', function (done) {
      const convertedFDF = pdfFiller.mapForm2PDF(_data, _convMap)
      expect(convertedFDF).to.be.deep.equal(_expected)
      done()
    })
  })
})
