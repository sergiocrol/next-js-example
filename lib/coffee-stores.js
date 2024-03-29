import { createApi } from "unsplash-js";

const unsplashApi = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_API_KEY,
});

const getUrlForCoffeeStores = (latLong, query, limit) => {
  return `https://api.foursquare.com/v3/places/search?query=${query}&ll=${latLong}&limit=${limit}`;
};

const getImagesOfCoffeStores = async () => {
  const photos = await unsplashApi.search.getPhotos({
    query: "coffee shop",
    perPage: 30,
  });

  const unsplashResults = photos?.response?.results.map(
    (result) => result.urls["small"]
  );

  return unsplashResults;
};

export const fetchCoffeeStores = async (
  latLong = "43.24907161731134,-2.940153717330441",
  limit = 6
) => {
  const photos = await getImagesOfCoffeStores();
  const query = "cafe";

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
    },
  };

  const response = await fetch(
    getUrlForCoffeeStores(latLong, query, limit),
    options
  );
  const data = await response.json();

  return data.results.map((result, idx) => {
    const neighborhood = result.location.neighborhood;
    return {
      id: result.fsq_id,
      name: result.name,
      address: result.location.address || "No address specified",
      neighborhood:
        neighborhood && neighborhood.length > 0
          ? neighborhood[0]
          : result.location.locality,
      imgUrl: photos?.length > 0 ? photos[idx] : null,
    };
  });
};
