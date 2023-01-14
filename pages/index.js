import React, { useContext } from "react";
import Head from "next/head";
import Image from "next/image";

import Banner from "../components/banner";
import Card from "../components/card";

import styles from "../styles/Home.module.css";

import useTrackLocation from "../hooks/use-track-location";

import { StoreContext, ACTION_TYPES } from "../store/store-context";
import { fetchCoffeeStores } from "../lib/coffee-stores";

export async function getStaticProps(context) {
  if (
    !process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY &&
    !process.env.AIRTABLE_API_KEY &&
    !process.env.AIRTABLE_BASE_ID &&
    !process.env.NEXT_PUBLIC_UNSPLASH_API_KEY
  ) {
    return {
      redirect: {
        destination: "/problem",
        permanent: false,
      },
    };
  }
  const coffeeStores = await fetchCoffeeStores();

  return {
    props: {
      coffeeStores,
    }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const {
    dispatch,
    state: { latLong, coffeeStores },
  } = useContext(StoreContext);
  const { handleTrackLocation, locationErrorMsg, isFindingLocation } =
    useTrackLocation();

  const handleOnBannerBtnClick = () => {
    handleTrackLocation();
  };

  const [coffeeStoresError, setCoffeeStoresError] = React.useState(null);

  React.useEffect(() => {
    if (latLong) {
      const getCurrentPositionCoffeeStores = async () => {
        try {
          const response = await fetch(
            `/api/getCoffeeStoresByLocation?latLong=${latLong}&limit=${30}`
          );

          const coffeeStores = await response.json();

          dispatch({
            type: ACTION_TYPES.SET_COFFEE_STORES,
            payload: {
              coffeeStores,
            },
          });
          setCoffeeStoresError("");
        } catch (error) {
          setCoffeeStoresError(error.message);
        }
      };

      getCurrentPositionCoffeeStores();
    }
  }, [latLong]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Banner
          buttonText={isFindingLocation ? "Locating..." : "View stores nearby"}
          handleOnClick={handleOnBannerBtnClick}
        />
        {locationErrorMsg && <p>Something went wrong: {locationErrorMsg}</p>}
        {coffeeStoresError && <p>Something went wrong: {coffeeStoresError}</p>}
        <div className={styles.heroImage}>
          <Image src="/static/hero-image.png" width={700} height={400} />
        </div>

        {coffeeStores.length > 0 && (
          <div className={styles.sectionWrapper}>
            <h2 className={styles.heading2}>Stores near me</h2>
            <div className={styles.cardLayout}>
              {coffeeStores.map((coffeeStore) => {
                return (
                  <Card
                    key={coffeeStore.id}
                    name={coffeeStore.name}
                    href={`/coffee-store/${coffeeStore.id}`}
                    imgUrl={
                      coffeeStore.imgUrl ||
                      "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"
                    }
                    className={styles.card}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.sectionWrapper}>
          <h2 className={styles.heading2}>Bilbao stores</h2>
          <div className={styles.cardLayout}>
            {props.coffeeStores.map((coffeeStore) => {
              return (
                <Card
                  key={coffeeStore.id}
                  name={coffeeStore.name}
                  href={`/coffee-store/${coffeeStore.id}`}
                  imgUrl={
                    coffeeStore.imgUrl ||
                    "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"
                  }
                  className={styles.card}
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
