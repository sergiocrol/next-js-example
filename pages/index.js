import React from "react";
import Head from "next/head";
import Image from "next/image";

import Banner from "../components/banner";
import Card from "../components/card";

import styles from "../styles/Home.module.css";

import coffeeStoresData from "../data/coffee-stores.json";

export async function getStaticProps(context) {
  return {
    props: {
      coffeeStores: coffeeStoresData,
    },
  };
}

export default function Home(props) {
  const handleOnBannerBtnClick = () => {
    console.log("Hi there!");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Coffee Connoisseur</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Banner
          buttonText="View stores nearby"
          handleOnClick={handleOnBannerBtnClick}
        />
        <div className={styles.heroImage}>
          <Image src="/static/hero-image.png" width={700} height={400} />
        </div>
        {props.coffeeStores.length > 0 && (
          <React.Fragment>
            <h2 className={styles.heading2}>Toronto stores</h2>
            <div className={styles.cardLayout}>
              {props.coffeeStores.map((coffeeStore) => {
                return (
                  <Card
                    key={coffeeStore.id}
                    name={coffeeStore.name}
                    href={`/coffee-store/${coffeeStore.id}`}
                    imgUrl={coffeeStore.imgUrl}
                    className={styles.card}
                  />
                );
              })}
            </div>
          </React.Fragment>
        )}
      </main>
    </div>
  );
}
