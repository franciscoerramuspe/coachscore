import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URL!; // Asegúrate de que esta variable de entorno esté configurada
let client: MongoClient;

export const connect = async () => {
  console.log('Intentando conectar a la base de datos...');
  if (!client) {
    client = new MongoClient(uri);
    try {
      await client.connect();
      console.log('Conexión exitosa a la base de datos');
    } catch (error) {
      console.error('Error al conectar a la base de datos:', error);
      throw error;
    }
  }
  return client.db(); // Devuelve la base de datos
};
