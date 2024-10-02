import { CreatePlaylistRequest, PopulateFavList, UpdatePlaylistRequest } from "#/@types/audio";
import { paginationQuery } from "#/@types/misc";
import Audio from "#/models/audio";
import Playlist from "#/models/playlist";
import { RequestHandler, response } from "express";
import { isValidObjectId } from "mongoose";

export const createPlaylist: RequestHandler = async (
  req: CreatePlaylistRequest,
  res
) => {
  const { title, audioId, visibility } = req.body;
  const ownerId = req.user.id;

  if (audioId) {
    const audio = await Audio.findById(audioId);
    if (!audio)
      return res.status(404).json({ error: "Could not found the audio !" });
  }

  const newPlaylist = new Playlist({
    title,
    owner: ownerId,
    visibility,
  });

  if (audioId) newPlaylist.items = [audioId as any];
  await newPlaylist.save();

  res.status(201).json({
    playlist: {
      id: newPlaylist._id,
      title: newPlaylist.title,
      visibility: newPlaylist.visibility,
    },
  });
};

export const updatePlaylist: RequestHandler = async (
  req: UpdatePlaylistRequest,
  res
) => {
  const { audioId, playlistId, title, visibility } = req.body;
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user.id },
    { title, visibility },
    { new: true }
  );

  if (!playlist) return res.status(404).json({ error: "Playlist not found!" });

  if (audioId) {
    const audio = await Audio.findById(audioId);
    if (!audio) return res.status(404).json({ error: "Audio not found!" });
    // empêcher l'ajout de doublon audio (addToSet)
    await Playlist.findByIdAndUpdate(playlist._id, {
      $addToSet: { items: audio },
    });
  }

  res.status(201).json({
    playlist: {
      id: playlist._id,
      title: playlist.title,
      visibility: playlist.visibility,
    },
  });
};

export const removePlaylist: RequestHandler = async (req, res) => {
  const { playlistId, audioId, all } = req.query;

  if (!isValidObjectId(playlistId))
    return res.status(422).json({ error: "Invalid playlist id !" });

  if (all === "yes") {
    const playlist = await Playlist.findOneAndDelete({
      _id: playlistId,
      owner: req.user.id,
    });
    if (!playlist)
      return response.status(404).json({ error: "Playlist not found !" });
  }

  if (audioId) {
    if (!isValidObjectId(audioId))
      return res.status(422).json({ error: "Invalid audio id !" });

    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: playlistId,
        owner: req.user.id,
      },
      {
        $pull: { items: audioId },
      }
    );
    if (!playlist)
      return response.status(404).json({ error: "Playlist not found !" });
  }

  res.json({ success: true });
};

export const getPlaylistByProfile: RequestHandler = async (req, res) => {
  // Pagination
  const { pageNumber = "0", limit = "20" } = req.query as paginationQuery

  const data = await Playlist.find({
    owner: req.user.id,
    visibility: { $ne: "auto" },
  })
    .skip(parseInt(pageNumber) * parseInt(limit))
    .limit(parseInt(limit))
    .sort("-createdAt");

  console.log(data)

  const playlist = data.map(item => {
    return {
      id: item._id,
      title: item.title,
      itemsCount: item.items.length,
      visibility: item.visibility,
    };
  });

  res.json({ playlist });
};

export const getAudios: RequestHandler = async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId))
    return res.status(422).json({ error: "Invalid playlist id! " });

  const playlist = await Playlist.findOne({
    owner: req.user.id,
    _id: playlistId,
  }).populate<{items: PopulateFavList[]}>({
    path: "items",
    populate: {
      path: "owner",
      select: "name",
    },
  });

  if (!playlist) return res.status(422).json({ list: [] });

  const audios = playlist.items.map(item => {
    return {
      id: item._id,
      title: item.title,
      category: item.category,
      file: item.file.url,
      poster: item.poster?.url,
      owner: { name: item.owner.name, id: item.owner._id },
    };
  });

  res.json({
    list: {
      title: playlist.title,
      id: playlist._id,
      audios,
    },
  });
};
