import { PopulateFavList } from "#/@types/audio";
import { paginationQuery } from "#/@types/misc";
import Audio from "#/models/audio";
import Favorite from "#/models/favorite";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";

export const toggleFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId as string;
  let status: "added" | "removed";

  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: "Audio id is invalid !" });

  const audio = await Audio.findById(audioId);

  if (!audio) return res.status(404).json({ error: "Resources not found !" });

  const alreadyExists = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  if (alreadyExists) {
    // on enlève l'audio de la liste des favoris du user
    await Favorite.updateOne(
      { owner: req.user.id },
      {
        $pull: { items: audioId },
      }
    );
    status = "removed";
  } else {
    const favorite = await Favorite.findOne({ owner: req.user.id });

    if (favorite) {
      // on ajoute l'audio à la liste de favoris existante du user
      await Favorite.updateOne(
        { owner: req.user.id },
        {
          $addToSet: { items: audioId },
        }
      );
    } else {
      // on crée une nouvelle liste favoris
      await Favorite.create({ owner: req.user.id, items: [audioId] });
    }
    status = "added";
  }

  if (status === "added") {
    await Audio.findByIdAndUpdate(audioId, {
      $addToSet: { likes: req.user.id },
    });
  }

  if (status === "removed") {
    await Audio.findByIdAndUpdate(audioId, {
      $pull: { likes: req.user.id },
    });
  }

  res.json({ status });
};

export const getFavorites: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { limit = "20", pageNumber = "0" } = req.query as paginationQuery;

  const favorites = await Favorite.aggregate([
    { $match: { owner: userId } },
    {
      $project: {
        audioIds: {
          $slice: [
            "$items",
            parseInt(limit) * parseInt(pageNumber),
            parseInt(limit),
          ],
        },
      },
    },
    { $unwind: "$audioIds" },
    {
      $lookup: {
        from: "audios",
        localField: "audioIds",
        foreignField: "_id",
        as: "audioInfo",
      },
    },
    { $unwind: "$audioInfo" },
    {
      $lookup: {
        from: "users",
        localField: "audioInfo.owner",
        foreignField: "_id",
        as: "ownerInfo",
      },
    },
    { $unwind: "$ownerInfo" },
    {
      $project: {
        _id: 0,
        id: "$audioInfo._id",
        title: "$audioInfo.title",
        about: "$audioInfo.about",
        category: "$audioInfo.category",
        file: "$audioInfo.file.url",
        poster: "$audioInfo.poster.url",
        owner: { name: "$ownerInfo.name", id: "$ownerInfo._id" },
      },
    },
  ]);

  res.json({ audios: favorites });
};

export const getIsFavorite: RequestHandler = async (req, res) => {
  const audioId = req.query.audioId as string;

  if (!isValidObjectId(audioId))
    return res.status(422).json({ error: "Invalid audio id !" });

  const favorite = await Favorite.findOne({
    owner: req.user.id,
    items: audioId,
  });

  res.json({ result: favorite ? true : false });
};
