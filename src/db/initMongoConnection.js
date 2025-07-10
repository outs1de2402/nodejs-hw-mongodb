import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();
//
export async function initMongoConnection() {
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
    process.env;

  const uri = `mongodb+srv://maksym:Mjyis34j1W3TUe2s@cluster0.wh5nx0r.mongodb.net/contacts?retryWrites=true&w=majority&appName=Cluster0`;

  await mongoose.connect(uri);
  logger.info('Mongo connection successfully established!');
}
