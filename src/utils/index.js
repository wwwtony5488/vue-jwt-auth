import axios from 'axios'

export const login = async ({
  url,
  payload,
}) => {
  const { data } = await axios.post(url, payload)
  return data
};

export const refresh = async ({
  url,
  payload,
  refreshKey,
}) => {
  const { data } = await axios.post(url, payload)
  return data[refreshKey]
};
