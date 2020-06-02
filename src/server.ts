import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { ApolloServer } from 'apollo-server';
import { buildSchema } from 'type-graphql';

import environment from './environment';

// Resolvers
import PlanetResolver from './modules/Planets/resolvers/PlanetResolver';

import ExoplanetJob from './jobs/Exoplanet';
/**
 * Disable ESLint no-console validation in this file, for consoling server status.
 */
/* eslint-disable no-console */

const bootstrap = async () => {
  try {
    // o .then é desnecessário com await
    await createConnection()

    console.log('Database connection successfully.')

    const schema = await buildSchema({
      resolvers: [PlanetResolver],
    });

    const server = new ApolloServer({
      schema,
      playground: environment.apollo.playground,
    });
    const { url } = await server.listen(environment.port);

    console.log(`Server has started on: ${url}`);

    const job = new ExoplanetJob();
    await job.getExoplanets();
  } catch (err) {
    console.error(err);
  }
};

bootstrap();
