import should from 'should';
import { DataFormatConverter } from '../src/DataFormatConverter';

const logger = {};
logger.info = console.log;
logger.error = console.error;
logger.debug = console.log;

const abstractConverter = new DataFormatConverter(logger);

describe('DataFormatConverter template loading', function () {

    it('should load templates', async function () {
        abstractConverter.templateDirectory = __dirname;
        const template = await abstractConverter.loadTemplate('testTemplate');
        template.foo.should.equal('bar');
    });

    it('should return false if no template is found', async function () {
        abstractConverter.templateDirectory = __dirname;
        const template = await abstractConverter.loadTemplate('testTemplateIsNotThere');
        template.should.equal(false);
    });

});