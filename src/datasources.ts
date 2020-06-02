// código antigo
import { PlanetDataSource } from './modules/Planets/datasources/PlanetDataSource';

export const DataSources = () => ({
  plan: new PlanetDataSource(),
});
