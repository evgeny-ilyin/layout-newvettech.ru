import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs}'],
		ignores: ['dist/**'], // игнорируем сборку
		plugins: { js },
		languageOptions: {
			globals: globals.browser,
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		...js.configs.recommended,
		plugins: {
			prettier: prettierPlugin,
		},
		extends: [
			prettierConfig, // включаем Prettier через ESLint
		],
		rules: {
			// Основные проверки ESLint
			'no-var': 'error', // запрет var -> только let/const
			'prefer-const': 'warn', // предлагать const вместо let
			'no-console': 'warn', // предупреждение при console.log
			curly: ['error', 'all'], // использовать фигурные скобки {} во всех блоках кода, где они возможны
			eqeqeq: ['error', 'always'], // строгое сравнение (=== вместо ==)
			// Код-стайл делегируем Prettier
			'prettier/prettier': 'error',
		},
	},
]);
