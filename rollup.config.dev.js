import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replace from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const fileName = 'index';
const extensions = ['.ts'];
const noDeclarationFiles = { compilerOptions: { declaration: false } };

export default [
    // UMD Development
    {
        input: 'src/index.ts',
        output: {
            file: `examples/${fileName}.js`,
            format: 'umd',
            name: 'ABC',
            indent: false
        },
        plugins: [
            nodeResolve({
                extensions
            }),
            commonjs(),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            babel({
                extensions,
                exclude: 'node_modules/**'
            }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('development')
            }),
            livereload(),
            serve({
                open: true,
                port: 2345,
                contentBase: 'examples'
            })
        ]
    }
];
