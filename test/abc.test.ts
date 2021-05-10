import { flag_1 } from './_mock_/xml_flag_1';
import { muti_statement_1, muti_statement_2 } from './_mock_/block_tobe_flatten';
import * as Util from '../src/utils/util';

const test_cases = {
    isBlockXml: ['', '<block />', '<block>a</block>']
}

const xml_demos = flag_1.map(item => item.expect[0].thread);

const test_getChildBlock = [
    {
        block: muti_statement_1.statement.block,
        expect: 4
    },
    {
        block: muti_statement_2.statement[1].block,
        expect: 2
    }
]

describe('util 方法验证', function () {

    xml_demos.forEach((xml, i) => {
        it(`isBlockXml of(${i})`, () => {
            const t = Util.isBlockXml(xml);
            expect(t).toBe(true);
        })
    })

    test_cases.isBlockXml.forEach((xml, i) => {
        it(`test_cases.isBlockXml(${i})`, () => {
            const t = Util.isBlockXml(<string>xml);
            expect(t).toBe(false);
        })
    })

    test_getChildBlock.forEach((item, i) => {
        it(`getChildBlock 方法 ${i}`, () => {
            const t = Util.getChildBlock(item.block, 0);
            console.warn(t);
            expect(t.length).toBe(item.expect);
        });
    })
});