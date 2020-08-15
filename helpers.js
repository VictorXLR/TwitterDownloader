const isUrl = require("is-url")
const parse = require("url-parse")



const calculateSize = function (vids) {
    // filtering only for mp4 videos OR filtering out m3u8 links
    vids = vids.filter(el => el.content_type === 'video/mp4')
    vids.sort((a, b) => {
        return a.bitrate - b.bitrate
    })
    return vids
}

exports.isUrl = url => isUrl(url)

exports.isTwitterURL = url => {
    const parsedURL = parse(url)

    if (parsedURL.hostname !== 'twitter.com' &&
        parsedURL.hostname !== 'www.twitter.com' &&
        parsedURL.hostname !== 'mobile.twitter.com')
        return false
    return true
}

// https://twitter.com/engineeringvids/status/1294115032586838016
// at index 3 we want the id which is 1294115032586838016
exports.getTweetPath = url => parse(url).pathname.split('/')[3]

exports.requestURL = tweetPath => `https://api.twitter.com/1.1/statuses/show.json?id=${tweetPath}&tweet_mode=extended`


exports.getVideoURL = (data, quality) => {
    if (data.hasOwnProperty('extended_entities') &&
        data.extended_entities.media[0].video_info) {
        let videoSizes = calculateSize(data.extended_entities.media[0].video_info.variants)

        let videoURL

        if (quality === "low") {
            videoURL = videoSizes[0]
        } else if (quality === "medium") {
            if (videoSizes.length > 1) videoURL = videoSizes[1]
        } else if (quality === "high") {
            if (videoSizes.length > 2) videoURL = videoSizes[videoSizes.length - 1]
            else if (videoSizes.length > 1) videoURL = videoSizes[1]
            else videoURL = videoSizes[0]
        }
        return videoURL.url
    } else return false
}