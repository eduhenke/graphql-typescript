import { Query, Resolver, Mutation, Arg } from 'type-graphql';
import { ApolloError } from 'apollo-server';

import { Planet } from '../entity/Planet';
import IPlanet from '../entity/IPlanet';

@Resolver(() => Planet)
export default class PlanetResolver {
  @Query(() => [Planet], { nullable: true })
  suitablePlanets(): Promise<Planet[]> {
    // dá de deixar só um pouquinho mais curto
    return Planet.find();
  }

  @Mutation(() => Planet)
  async installStation(@Arg('id') id: number): Promise<IPlanet | ApolloError> {
    // eu daria o nome: planetToInstall, ou só planet também
    const installPlanet = await Planet.findOne({ id });

    if (!installPlanet) {
      return new ApolloError('Planet not found. :/');
    }

    if (installPlanet.hasStation === true) {
      // hahaha, boa mensagem de erro
      return new ApolloError('Houston. This planet already has station. :/');
    }

    installPlanet.hasStation = true;

    return await Planet.save(installPlanet);
  }
}
