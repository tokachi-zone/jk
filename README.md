## requirements
We use [Volta](https://volta.sh/) as a version control tool for Node and its package managers. We recommend installing Volta. If you do not have Volta installed, please confirm that the versions of node and yarn match the specified versions in the Volta section of `package.json`.

## commit rules

### setup
All you need to do for that is create a configuration file for git-cz to read.  
You can use the `changelog.config.js` found [here](https://github.com/jpnykw/dotfiles/blob/main/.github/changelog.config.js) as is.

### poem
Commit messages must be prefixed with a prefix. However, as long as the granularity of the pull request is correct, we do not require the commit message to be precise or strict. In this role, we use git-cz to add a prefix so that you can quickly understand what files you have edited and what changes you have made.  

> Tips: you can use [git-cz](https://github.com/streamich/git-cz) without install like this: `npx git-cz`  
> (But, don't forget to set up the config file as it is essential!)

## scripts
- `$ yarn build` compiles `*.ts` files under `/src` and generates `*.js` files under `/build`.
- `$ yarn start` execute `main.js` under `/build`. Be careful not to forget to compile.