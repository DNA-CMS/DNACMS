module.exports = {
    root: true,
    extends: ['dna-eslint'].map(require.resolve),
    parserOptions: {
        project: ['./tsconfig.json',],
        tsconfigRootDir: __dirname,
    },
    rules: {
    }
};
