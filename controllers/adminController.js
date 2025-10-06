const mongoose = require('mongoose')

const levelMap = {
  'level-1': 1,
  'level-2': 2,
  'level-3': 3
};

const powerMap = {
  'moderator': 1,
  'admin': 2
}

const restrictUser = async (User, req, res) => {
  const userID = req?.params?.userID
  const type = req?.query?.type || 'level-1'
  const duration = req?.query?.duration

  const level = levelMap[type]
  if (!level) {
    return res.status(400).json({ code: '040', data: 'Invalid restriction type' });
  }

  const reason = req?.query?.reason || `Level ${level} restriction`

  const durationSec = parseInt(duration) > 0
    ? parseInt(duration)
    : 0; // in seconds

  if (durationSec < 300 || durationSec > 86400) {
    return res.status(403).json({ code: '042', data: 'Duration is too short or too long!'})
  }

  if (reason?.length > 50) {
    return res.status(403).json({ code: '043', data: 'Reason length is too long!'})
  }

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ code: '010', data: 'Invalid userID!' })
  }

  try {
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ code: '001', data: 'User not found'})
    }

    user.role = 'restricted'
    user.restrictionObject.level = level;
    user.restrictionObject.expiresAt = new Date(Date.now() + durationSec * 1000);
    user.restrictionObject.reason = reason;

    await user.save()

    return res.status(200).json({ code: '038', data: `${user.username} just got smacked by a level ${level} restriction that will self-destruct in ${(durationSec/60).toFixed(2)} minute${durationSec/60 === 1 ? '' : 's'}... tick tock ⏳` })
  } catch(e) {
    return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
  }
}

const unRestrictUser = async (User, req, res) => {
  const userID = req?.params?.userID

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ code: '010', data: 'Invalid userID!' })
  }

  try {
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ code: '001', data: 'User not found'})
    }

    const prevRestrictionLevel = user.restrictionObject.level

    user.role = 'user'
    user.restrictionObject.level = null;
    user.restrictionObject.expiresAt = null;
    user.restrictionObject.reason = null;

    await user.save()

    return res.status(200).json({ code: '042', data: `${user.username} just got independence from a level ${prevRestrictionLevel} restriction!` })
  } catch(e) {
    return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
  }
}

const giveAuthority = async (User, req, res) => {
  const authorityType = req?.query?.authorityType || 'moderator'
  const userID = req?.params?.userID

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return res.status(400).json({ code: '010', data: 'Invalid userID!' })
  }

  const authorityTypes = ['moderator']

  if (!authorityTypes.includes(authorityType)) {
    return res.status(400).json({ code: '010', data: 'Invalid authority type!' })
  }

  try {
    const user = await User.findById(userID)
    if (!user) {
      return res.status(404).json({ code: '001', data: 'User not found'})
    }

    user.role = authorityType

    await user.save()

    return res.status(200).json({ code: '043', data: `${user.username} just got authority: ${authorityType}` })
  } catch(e) {
    return res.status(500).json({ code: '550', data: "Unexpected error occured!" })
  }

}

module.exports = { restrictUser, unRestrictUser, giveAuthority }