const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlBeautifierPlugin = require('html-beautifier-webpack-plugin'); // You can pass a conf options which is js-beautify's options. https://github.com/beautifier/js-beautify
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const svgstore = require('svgstore');
const { optimize } = require('svgo');
const ESLintPlugin = require('eslint-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

class RemoveCopiedFilePlugin {
	constructor(fileToRemove) {
		this.fileToRemove = fileToRemove;
	}
	apply(compiler) {
		compiler.hooks.afterEmit.tap('RemoveCopiedFilePlugin', (compilation) => {
			const filePath = path.resolve(compiler.options.output.path, this.fileToRemove);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				// console.log(`Файл удалён: ${filePath}`);
			}
		});
	}
}

function inlineSprite() {
	const options = {
		inline: true,
		svgAttrs: {
			class: 'svg-sprite',
		},
	};
	const iconsDir = path.resolve(__dirname, 'src/svg');
	const sprites = svgstore(options);

	fs.readdirSync(iconsDir).forEach((file) => {
		if (!file.endsWith('.svg')) {
			return;
		}
		const filepath = path.join(iconsDir, file);
		const id = path.parse(file).name;
		const svg = fs.readFileSync(filepath, 'utf8');

		// оптимизируем только текущий svg и задаём уникальный префикс
		const optimized = optimize(svg, {
			multipass: true,
			plugins: [
				{ name: 'prefixIds', params: { prefix: `${id}` } }, // уникальный префикс
			],
		});

		sprites.add(id, optimized.data);
	});

	return sprites.toString();
}

function generateHtmlPlugins(templateDir) {
	const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
	return templateFiles.map((filename) => {
		const name = path.parse(filename).name;
		return new HtmlWebpackPlugin({
			filename,
			template: path.resolve(__dirname, `${templateDir}/${filename}`),
			cache: false,
			minify: false,
			chunks: ['main', name],
			inject: 'body',
			templateParameters: {
				sprite: inlineSprite(),
			},
		});
	});
}

const htmlPlugins = generateHtmlPlugins('src/html/pages');

const config = {
	entry: {
		main: ['./src/js/main.js', './src/scss/main.scss'],
		// about: ['./src/js/about.js', './src/scss/about.scss'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].js',
		clean: true,
	},
	mode: 'development',
	devtool: 'source-map',
	target: 'web',
	module: {
		rules: [
			{
				test: /\.(c||sa||sc)ss$/,
				include: path.resolve(__dirname, 'src/scss'),
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							url: {
								filter: (url, resourcePath) => {
									// Обрабатываем только шрифты
									return /\.(woff2?|eot|ttf|otf)(\?.*)?$/.test(url);
								},
							},
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									[
										'postcss-preset-env',
										{
											stage: 1, // Активирует только достаточно зрелые фичи, безопасные для прода. Не включает нестабильные/экспериментальные функции (stage 0).
											features: {
												'custom-properties': false, // ❗ Сохраняет var(--*) и удаляет fallback'и
											},
										},
									],
								],
							},
						},
					},
					{
						loader: 'sass-loader',
						options: {
							additionalData: `
								@use "abstracts" as *;
							`,
							sassOptions: {
								// quietDeps: true,
								// silenceDeprecations: ["mixed-decls"],
							},
						},
					},
				],
			},
			{
				test: /\.html$/,
				include: [
					path.resolve(__dirname, 'src/html/components'),
					// path.resolve(__dirname, 'src/html/layout'),
				],
				use: [
					{
						loader: 'html-loader',
						options: {
							minimize: false,
							// sources: false, // отключает обработку путей в HTML
							sources: {
								list: [
									// Обработка только относительных путей
									{
										tag: 'img',
										attribute: 'src',
										type: 'src',
										filter: (tag, attr, value) => {
											return value?.value && !value.value.startsWith('/');
										},
									},
									{
										tag: 'link',
										attribute: 'href',
										type: 'src',
										filter: (tag, attr, value) => {
											return value?.value && !value.value.startsWith('/');
										},
									},
								],
							},
						},
					},
				],
			},
			{
				test: /\.(?:js|mjs|cjs)$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
				},
			},
			{
				test: /\.(woff2?|eot|ttf|otf)$/i,
				type: 'asset/resource',
				generator: {
					filename: 'fonts/[name][ext]',
				},
			},
			// {
			// 	test: /\.(png|jpe?g)$/i,
			// 	type: "asset/resource",
			// 	generator: {
			// 		filename: "img/[name][ext]",
			// 	},
			// },
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/[name].css',
		}),
		new CopyPlugin({
			patterns: [
				{ from: 'src/img', to: 'img' },
				{ from: 'src/favicon', to: 'favicon' },
				{ from: 'src/og', to: 'og' },
				{ from: 'src/download', to: 'download' },
				{ from: 'src/favicon/favicon.ico', to: 'favicon.ico' },
				{ from: 'src/favicon/apple-touch-icon.png', to: 'apple-touch-icon.png' },
				{ from: 'src/humans.txt', to: 'humans.txt', noErrorOnMissing: true },
				{ from: 'src/favicon/manifest.webmanifest', to: 'manifest.webmanifest' },
				{ from: 'src/favicon/tableau.json', to: 'tableau.json' },
			],
		}),
		// new RemoveCopiedFilePlugin("favicon/favicon.ico"),
		new RemoveCopiedFilePlugin('favicon/manifest.webmanifest'),
		new RemoveCopiedFilePlugin('favicon/tableau.json'),
		new HtmlBeautifierPlugin({
			html: {
				indent_with_tabs: true,
				wrap_line_length: 0,
			},
		}),
		// Генерирует webp при каждой сборке. Чтобы оставить только прод — раскомментировать вызов в optimization
		new ImageMinimizerPlugin({
			deleteOriginalAssets: false,
			minimizer: {
				implementation: ImageMinimizerPlugin.imageminGenerate,
				options: {
					plugins: [['imagemin-webp', { quality: 75 }]],
				},
				filename: ({ filename }) => filename.replace(/\.(jpe?g|png)$/i, '.webp'),
				// Фильтрация: обрабатываем только файлы из dist/img
				filter: (source, sourcePath) => {
					const isImg = /\.(jpe?g|png)$/i.test(sourcePath);
					// Путь будет относительным от корня проекта
					const isInImgFolder = sourcePath.includes('img/');
					// console.log('Processing:', sourcePath);
					// Только изображения из dist/img, исключаем favicon
					return isInImgFolder && isImg;
				},
			},
		}),
		new ESLintPlugin({
			extensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx'],
			emitWarning: true, // показывать предупреждения
			failOnError: false, // не ломать сборку на ошибках
		}),
		new webpack.DefinePlugin({
			'process.env.YANDEX_MAPS_API_KEY': JSON.stringify(process.env.YANDEX_MAPS_API_KEY),
		}),
		...htmlPlugins,
	],
	optimization: {
		// splitChunks: {
		// 	chunks: "all",
		// },
		minimizer: [
			// For webpack@5 you can use the `...` syntax to extend existing minimizers
			`...`,
			new CssMinimizerPlugin({
				minimizerOptions: {
					preset: [
						'default',
						{
							discardComments: { removeAll: true },
							minifyFontValues: { removeQuotes: false }, // Сохраняет кавычки вокруг шрифта
						},
					],
				},
			}),
			// Генерирует webp только для прода
			// new ImageMinimizerPlugin({
			// 	deleteOriginalAssets: false,
			// 	minimizer: {
			// 		implementation: ImageMinimizerPlugin.imageminGenerate,
			// 		options: {
			// 			plugins: [["imagemin-webp", { quality: 75 }]],
			// 		},
			// 		filename: ({ filename }) => filename.replace(/\.(jpe?g|png)$/i, ".webp"),
			// 		// Фильтрация: обрабатываем только файлы из dist/img
			// 		filter: (source, sourcePath) => {
			// 			const isImg = /\.(jpe?g|png)$/i.test(sourcePath);
			// 			// Путь будет относительным от корня проекта
			// 			const isInImgFolder = sourcePath.includes("img/");
			// 			// console.log('Processing:', sourcePath);
			// 			// Только изображения из dist/img, исключаем favicon
			// 			return isInImgFolder && isImg;
			// 		},
			// 	},
			// }),
		],
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		port: 9000,
		hot: true,
		open: true,
		watchFiles: ['src/html/**/*.html', 'src/scss/**/*.scss', 'src/js/**/*.js', 'src/img/**/*.*'], // svg файлы не отслеживаются
	},
};

module.exports = (_env, argv) => {
	if (argv.mode === 'production') {
		config.mode = 'production';
		config.devtool = false;
	}
	return config;
};
