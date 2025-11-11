import { marshall } from "@aws-sdk/util-dynamodb";
import { Movie, Actor, MovieCast, Award } from "./types";

type Entity = Movie | Actor | MovieCast | Award;  // NEW
export const generateItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
 },
 };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateItem(e);
  });
};

