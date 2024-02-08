const API_KEY = "AIzaSyAbx1H3Gc3Q3r1nzFQyl_tT-TlVIftkl0E";

export function fetchChannelsHistory() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["channels"], (obj) => {
      resolve(obj["channels"] ? JSON.parse(obj["channels"]) : {});
    });
  });
}

export async function fetchAndSetChannelLogo(channel_id, channel_logo_element) {
  const res = await fetch(
    "https://youtube.googleapis.com/youtube/v3/channels?" +
      `id=${channel_id}&fields=items(snippet(thumbnails))&part=snippet&key=${API_KEY}`
  );

  const data = await res.json();
  const LogoUrl = data.items[0].snippet.thumbnails.medium.url;
  channel_logo_element.src = LogoUrl;

  const currentChannels = await fetchChannelsHistory();
  currentChannels[channel_id]["logo_url"] = LogoUrl;

  chrome.storage.local.set({
    ["channels"]: JSON.stringify(currentChannels),
  });
}

export async function fetchChannelIdByVideoId(video_id) {
  const res = await fetch(
    "https://youtube.googleapis.com/youtube/v3/videos?" + 
    `id=${video_id}&fields=items(snippet(channelId))&part=snippet&key=${API_KEY}`
  );
  const data = res.json();
  return data.items.snippet.channelId;
}

export async function fetchChannelIdByName(channel_name) {
  try {
    console.log("--- fetching ID by requesting channel page----");
    const res = await fetch(`https://www.youtube.com/${channel_name}`);
    // pattern example : "channelId":"UCUZWSD1JrY7ZEXpKmcSygiA"
    const res_body = await res.text();
    const ChannelIdRegex = /"channelId":"([\w-]+)"/;
    return ChannelIdRegex.exec(res_body)[1];
  } catch {
    return null;
  }
}

export async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    active: true,
  });

  return tabs[0];
}

export function objectLength(object) {
  return Object.keys(object).length;
}

export function truncateWithEllipsis(string, maxLength = 57) {
  if (string.length > maxLength) {
    return string.substring(0, maxLength - 3) + "...";
  }
  return string;
}

export function getFormatedVideoDuration(duration_seconds) {
  const n_hrs = Math.floor(duration_seconds / 3600);
  const n_minutes = Math.floor((duration_seconds % 3600) / 60);
  const n_seconds = Math.round(duration_seconds % 60);

  if (n_hrs > 0) {
    return `${n_hrs}:${n_minutes > 9 ? n_minutes : "0" + n_minutes}:${
      n_seconds > 9 ? n_seconds : "0" + n_seconds
    }`;
  }

  return `${n_minutes}:${n_seconds > 9 ? n_seconds : "0" + n_seconds}`;
}

export function getFormatedDateTime(date_time_string) {
  const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const date_time = new Date(date_time_string);
  const year = date_time.getFullYear();
  const current_year = new Date().getFullYear();

  // omit year from date if it's the current year (for convention)
  const date = `${MONTH_NAMES[date_time.getMonth()]} ${date_time.getDate()}${
    year !== current_year ? ", " + year : ""
  }`;

  const time = date_time.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  return `${date},  at ${time}`;
}
