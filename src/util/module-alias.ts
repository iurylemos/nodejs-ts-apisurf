import path from 'path';
import moduleAlias from 'module-alias';

//Pegando o diretorio que a gente está, volta a pasta e pega todos os arquivos
const files = path.resolve(__dirname, '../..');

moduleAlias.addAliases({
  "@src": path.join(files, 'src'),
  "@test": path.join(files, 'test')
});