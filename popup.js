import {
  fetchAndSetChannelLogo,
  truncateWithEllipsis,
  objectLength,
  getActiveTabURL,
  getFormatedDateTime,
  getFormatedVideoDuration,
} from "./utils.js";

const viewChannelVideos = (videos_container, videos, videos_ids) => {
  videos_ids.forEach((video_id) => {
    const VideoContainer = document.createElement("div");

    const ThumbnailContainer = document.createElement("a");
    const VideoInfoContainer = document.createElement("div");

    const VideoThumbnail = document.createElement("img");
    const DateTimeElement = document.createElement("div");
    const DurationElement = document.createElement("div");

    VideoContainer.id = video_id;
    VideoContainer.className = "video_container";

    ThumbnailContainer.href = `https://www.youtube.com/watch?v=${video_id}`;
    ThumbnailContainer.target = "_blank";
    ThumbnailContainer.title = "open video";
    ThumbnailContainer.className = "thumbnail_container";

    VideoThumbnail.src = `https://img.youtube.com/vi/${video_id}/mqdefault.jpg`;
    VideoThumbnail.loading = "lazy";
    VideoThumbnail.alt = "thumbnail";
    VideoThumbnail.className = "thumbnail";
    ThumbnailContainer.appendChild(VideoThumbnail);

    VideoInfoContainer.className = "video_info_container";
    VideoInfoContainer.textContent = truncateWithEllipsis(
      videos[video_id].title
    );
    VideoInfoContainer.title = videos[video_id].title;

    DateTimeElement.className = "date_time";
    DateTimeElement.title = "watch date and time";
    DateTimeElement.innerHTML = `<strong>${getFormatedDateTime(
      videos[video_id].date_time
    )}</strong>`;

    DurationElement.className = "duration";
    DurationElement.textContent = getFormatedVideoDuration(
      videos[video_id].duration
    );

    ThumbnailContainer.appendChild(DurationElement);
    VideoInfoContainer.appendChild(DateTimeElement);
    VideoContainer.appendChild(ThumbnailContainer);
    VideoContainer.appendChild(VideoInfoContainer);
    videos_container.appendChild(VideoContainer);
  });
};

const viewChannels = (channels, channels_ids) => {
  const ChannelsContainer = document.getElementById("channels");
  const NChannelsDiv = document.getElementsByTagName("h3")[0];
  NChannelsDiv.innerHTML = `${channels_ids.length} channels`;

  channels_ids.forEach((channel_id) => {
    // create element for each channel
    const NewChannelContainer = document.createElement("div");
    const ChannelINfoContainer = document.createElement("div");
    const ChannelName = document.createElement("a");
    const ChannelLogo = document.createElement("img");
    const NChannelVideos = document.createElement("h4");
    const ChannelVideos = document.createElement("div");
    
    ChannelLogo.className = "channel-logo";
    ChannelLogo.alt = "channel logo";
    ChannelLogo.draggable = false;

    channels[channel_id].logo_url
      ? (ChannelLogo.src = channels[channel_id].logo_url)
      : fetchAndSetChannelLogo(channel_id, ChannelLogo);

    NewChannelContainer.id = channel_id;
    NewChannelContainer.name = channels[channel_id].name;
    NewChannelContainer.className = "channel";

    // should be  deleted
    //NewChannelContainer.innerHTML = `<strong>${channel_id}</strong><br><br>`;

    ChannelINfoContainer.className = "channel-info";
    ChannelName.href = channels[channel_id].url;
    ChannelName.title = "go to channel";
    ChannelName.target = "_blank";
    ChannelName.className = "channel-name";
    ChannelName.textContent = channels[channel_id].name;

    ChannelVideos.className = "videos_container";
    const VideosIds = Object.keys(channels[channel_id]["videos"]).reverse();
    NChannelVideos.textContent = VideosIds.length + " videos";

    ChannelINfoContainer.appendChild(ChannelLogo);
    ChannelINfoContainer.appendChild(ChannelName);
    NewChannelContainer.appendChild(ChannelINfoContainer);

    viewChannelVideos(ChannelVideos, channels[channel_id]["videos"], VideosIds);

    NewChannelContainer.appendChild(NChannelVideos);
    NewChannelContainer.appendChild(ChannelVideos);
    ChannelsContainer.appendChild(NewChannelContainer);
  });
};

const viewMostWatchedChannels = async (channels) => {
  const SortedChannels = Object.entries(channels).sort(
    (channelA, channelB) =>
      objectLength(channelB[1].videos) - objectLength(channelA[1].videos)
  );
  const TopChannels = [SortedChannels[0][0]];
  const NMostWatchedChannelVideo = objectLength(
    channels[SortedChannels[0][0]].videos
  );

  for (let i = 1; i < SortedChannels.length; i++) {
    if (
      objectLength(channels[SortedChannels[i][0]].videos) ===
      NMostWatchedChannelVideo
    ) {
      TopChannels.push(SortedChannels[i][0]);
    }
  }

  const MostViewedDiv = document.getElementsByClassName("top-channels")[0];

  TopChannels.forEach((channel_id) => {
    const NewChannelContainer = document.createElement("div");
    const ChannelINfoContainer = document.createElement("div");
    const ChannelLogo = document.createElement("img");
    const ChannelNameUrl = document.createElement("a");
    const NChannelVideos = document.createElement("div");

    ChannelLogo.className = "channel-logo";
    ChannelLogo.draggable = false;

    channels[channel_id].logo_url
      ? (ChannelLogo.src = channels[channel_id].logo_url)
      : fetchAndSetChannelLogo(channel_id, ChannelLogo);

    NewChannelContainer.className = "top-channel";
    ChannelINfoContainer.className = "top-channel-info";

    ChannelNameUrl.href = channels[channel_id].url;
    ChannelNameUrl.title = "go to channel";
    ChannelNameUrl.target = "_blank";
    ChannelNameUrl.className = "channel-name";
    ChannelNameUrl.textContent = channels[channel_id].name;

    NChannelVideos.textContent =
      objectLength(channels[channel_id]["videos"]) + " videos";

    ChannelINfoContainer.appendChild(ChannelNameUrl);
    ChannelINfoContainer.appendChild(NChannelVideos);

    NewChannelContainer.appendChild(ChannelLogo);
    NewChannelContainer.append(ChannelINfoContainer);
    NewChannelContainer.appendChild(ChannelINfoContainer);
    MostViewedDiv.appendChild(NewChannelContainer);
  });
};

const filterChannels = () => {
  const NochannelsMatch = document.getElementsByClassName("no-match")[0];

  const Channels = document.getElementsByClassName("channel");
  const SearchChannelsInput = document.getElementsByTagName("input")[0];

  SearchChannelsInput.addEventListener("input", (event) => {
    const searched_text = event.target.value.toLowerCase();
    let result_found = false;

    for (const channel of Channels) {
      if (
        /^\s*$/.test(searched_text) ||
        channel.name.toLowerCase().includes(searched_text)
      ) {
        result_found = true;
        channel.style.display = "block";
      } else {
        channel.style.display = "none";
      }
    }
    NochannelsMatch.style.display = result_found ? "none" : "block";
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getActiveTabURL();
  const MainContainer = document.getElementsByClassName("container")[0];

  if (activeTab.url.includes("youtube.com/")) {
    chrome.storage.local.get(["channels"], (data) => {
      const Channels = data["channels"] ? JSON.parse(data["channels"]) : {};

      // channels are displayed in reverse chronological order (i.e. recently viewed from top to bottom)
      const ChannelsIds = Object.keys(Channels).reverse();
      if (ChannelsIds.length > 0) {
        const ClearHistoryBtn = document.getElementsByTagName("button")[0];
        ClearHistoryBtn.addEventListener("click", () => {
          chrome.storage.local.clear();
          MainContainer.textContent = "No Channels watched";
        });

        viewMostWatchedChannels(Channels);
        viewChannels(Channels, ChannelsIds);
        filterChannels();
      } else {
        MainContainer.textContent = "No Channels watched";
      }
    });
  } else {
    MainContainer.textContent = "Go to youtube to use this extension";
  }
});
