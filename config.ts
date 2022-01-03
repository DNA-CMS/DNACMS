export const config = {
  db: {
    uri: 'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
    database: 'cms',
    prefix: 'dna_'
  },
  debug: false,
  salts: {
    auth: 'put your unique phrase here',
    nonce: 'put your unique phrase here'
  }
};
