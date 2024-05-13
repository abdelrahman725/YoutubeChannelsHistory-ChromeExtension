(async () => {
  let PreviousUrl = null;
  let PreviousVideoTitle = null;

  const utils = await import(chrome.runtime.getURL("utils.js"));

  const parseChannelLogo = () => {
    let channelContainer = document.getElementsByTagName(
      "ytd-video-owner-renderer"
    );

    if (channelContainer.length === 1) {
      channelContainer = channelContainer[0];
    } else {
      channelContainer = document.getElementById("owner");
    }

    return channelContainer.getElementsByTagName("img")[0].src;
  };

  const getChannelUrl = () => {
    try {
      return document.getElementById("upload-info").getElementsByTagName("a")[0]
        .href;
    } catch {
      return null;
    }
  };

  const parseChannelName = (url) => {
    const UrlSplitted = url.split("/");
    return UrlSplitted[UrlSplitted.length - 1];
  };

  const getChannelDisplayName = () => {
    return document.querySelector("#header-text #title").innerHTML;
  };

  // parse/fetch channel id for the current youtube video by trying out different methods
  const getChannelId = async (channel_url) => {
    const ParsedChannelId = parseChannelName(channel_url);

    if (ParsedChannelId && ParsedChannelId[0] !== "@") {
      return ParsedChannelId;
    }

    if (window.ytInitialPlayerResponse) {
      if (window.ytInitialPlayerResponse.videoDetails) {
        return window.ytInitialPlayerResponse.videoDetails.channelId;
      }

      if (
        window.ytInitialPlayerResponse.microformat &&
        window.ytInitialPlayerResponse.microformat.playerMicroformatRenderer &&
        window.ytInitialPlayerResponse.microformat.playerMicroformatRenderer
          .externalChannelId
      ) {
        return window.ytInitialPlayerResponse.microformat
          .playerMicroformatRenderer.externalChannelId;
      }
    }

    const ACTION_BTNS = document.getElementById("action-buttons");

    if (ACTION_BTNS && ACTION_BTNS.getElementsByTagName("a")[0]) {
      const URL_CONTAINRS_ID =
        ACTION_BTNS.getElementsByTagName("a")[0].href.split("/");
      return URL_CONTAINRS_ID[URL_CONTAINRS_ID.length - 2];
    }

    const ChannelId = ParsedChannelId
      ? await utils.fetchChannelIdByName(ParsedChannelId)
      : null;
    return ChannelId;
  };

  const parseVideoId = (url) => {
    const urlParameters = new URLSearchParams(url.split("?")[1]);
    return urlParameters.get("v");
  };

  const getVideoTitle = () => {
    try {
      return document.querySelector("#above-the-fold h1").innerText;
    } catch {
      return null;
    }
  };

  const getVideoDuration = () => {
    return document.getElementsByClassName("video-stream")[0].duration;
  };

  // save channel and video in storage
  const newWatchHistory = async (video_title) => {
    const videoId = parseVideoId(PreviousUrl);
    const videoDuration = getVideoDuration();

    const ChannelDisplayName = getChannelDisplayName();
    const ChannelUrl = getChannelUrl();
    const ChannelId = await getChannelId(ChannelUrl);
    const ChannelLogo = parseChannelLogo();

    console.log("--------------------------------");
    console.log("Video ID : ", videoId);
    console.log("Video Title : ", video_title);
    console.log("Channel Name : ", ChannelDisplayName);
    console.log("Channel ID   : ", ChannelId);
    console.log("channel img: ", ChannelLogo);
    console.log("--------------------------------");

    if (ChannelId) {
      const currentChannels = await utils.fetchChannelsHistory();

      if (!(ChannelId in currentChannels)) {
        currentChannels[ChannelId] = { videos: {} };
      }

      if (!("name" in currentChannels[ChannelId])) {
        currentChannels[ChannelId]["name"] = ChannelDisplayName;
      }

      currentChannels[ChannelId]["url"] = ChannelUrl;
      currentChannels[ChannelId]["logo_url"] = ChannelLogo;

      delete currentChannels[ChannelId]["videos"][videoId];
      currentChannels[ChannelId]["videos"][videoId] = {
        title: video_title,
        date_time: new Date(),
        duration: videoDuration,
      };

      const channelCopy = currentChannels[ChannelId];
      delete currentChannels[ChannelId];
      currentChannels[ChannelId] = channelCopy;

      chrome.storage.local.set({
        ["channels"]: JSON.stringify(currentChannels),
      });
    }
  };

  const metaDataRendered = () => {
    const metaChangedInterval = setInterval(() => {
      const CurrentVideoTitle = getVideoTitle();

      if (CurrentVideoTitle && CurrentVideoTitle !== PreviousVideoTitle) {
        PreviousVideoTitle = CurrentVideoTitle;
        newWatchHistory(CurrentVideoTitle);
        clearInterval(metaChangedInterval);
        clearTimeout(checkMetaTimeout);
      }
    }, 1000);

    const checkMetaTimeout = setTimeout(() => {
      clearInterval(metaChangedInterval);
    }, 6000);
  };

  const videoPlaying = async () => {
    console.log("video playing...");
    const CurrentUrl = window.location.href;

    // check if the opened youtube video is in the active visible tab
    // and check if it's a new youtube video playing
    if (
      !document.hidden &&
      CurrentUrl.includes("youtube.com/watch") &&
      CurrentUrl !== PreviousUrl
    ) {
      PreviousUrl = CurrentUrl;
      metaDataRendered();
    }
  };

  const Observer = new MutationObserver(() => {
    console.log("listening for mutations...");
    const mainVideo = document.getElementsByClassName("html5-main-video")[0];

    if (mainVideo) {
      videoPlaying();
      mainVideo.oncanplay = videoPlaying;
      Observer.disconnect();
    }
  });

  const YoutubeApp = document.getElementsByTagName("ytd-app")[0];

  Observer.observe(YoutubeApp, {
    subtree: true,
    childList: true,
  });
})();
