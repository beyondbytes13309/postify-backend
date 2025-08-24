const mongoose = require("mongoose");

const makeReaction = async (Reaction, Post, Comment, req, res) => {
  const resourceID = req?.body?.resourceID;
  const reactionType = req.body.reactionType;
  const resType = req.body.resType;

  const resTypes = ["comment", "post"];

  if (!resTypes.includes(resType)) {
    return res
      .status(400)
      .json({
        code: "010",
        data: "You did not provide a resource type e.g post or comment",
      });
  }

  const authorID = req?.user?._id;

  if (!resourceID || !typeof reactionType === "number") {
    return res.status(400).json({ code: "010", data: "Data required!" });
  }

  const resource =
    resType == "post"
      ? await Post.findOne({ _id: resourceID })
      : resType == "comment"
      ? await Comment.findOne({ _id: resourceID })
      : null;

  if (!resource) {
    const errorObject = {
      code: resType == "post" ? "016" : resType == "comment" ? "034" : "550",
      data: resType == 'post' ? 'Post not found!' : resType=='comment' ? 'Comment not found!' : 'Unexpected error occured!'
    };
    return res.status(404).json(errorObject);
  }

  let reaction = await Reaction.findOne({ authorID, resourceID });
  let message;

  if (reaction) {
    reaction.reactionType = reactionType;
    message = "Modified reaction successfully";
  } else {
    reaction = new Reaction({
      authorID: authorID,
      reactionType: reactionType,
      resourceID: resourceID,
    });
    message = "Created reaction successfully";
  }

  try {
    await reaction.save();
    return res
      .status(201)
      .json({ code: "017", data: message || "Something is fishy..." });
  } catch (e) {
    if (e.name == "ValidationError") {
      if (e.errors?.reactionType?.kind == "max") {
        return res
          .status(400)
          .json({
            code: "023",
            data: "reactionType is greater than limit of 10",
          });
      } else if (e.errors?.reactionType?.kind == "min") {
        return res
          .status(400)
          .json({
            code: "023",
            data: "reactionType is smaller than limit of 0",
          });
      } else if (e.errors?.authorID?.kind == "required") {
        return res
          .status(400)
          .json({ code: "023", data: "authorID is required!" });
      } else if (e.errors?.resourceID?.kind == "required") {
        return res
          .status(400)
          .json({ code: "023", data: "resourceID is required" });
      }

      return res.status(400).json({ code: "023", data: "Incorrect data" });
    }
    return res
      .status(500)
      .json({ code: "550", data: "Unexpected error occured!" });
  }
};

const deleteReaction = async (Reaction, Post, req, res) => {
  const reactionID = req.params.reactionID;

  if (!mongoose.Types.ObjectId.isValid(reactionID)) {
    return res.status(400).json({ code: "010", data: "Data required!" });
  }

  let reaction;

  try {
    reaction = await Reaction.findOne({ _id: reactionID });
  } catch (e) {
    return res
      .status(500)
      .json({ code: "550", data: "Unexpected error occured!" });
  }

  if (!reaction) {
    return res.status(404).json({ code: "018", data: "Reaction not found!" });
  }

  await Reaction.deleteOne({ _id: reactionID });
  return res
    .status(200)
    .json({ code: "018", data: "Reaction deleted successfully" });
};

module.exports = { makeReaction, deleteReaction };
