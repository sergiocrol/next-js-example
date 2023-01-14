import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import cls from "classnames";

import { fetchCoffeeStores } from "../../lib/coffee-stores";

import { isEmpty } from "../../utils";
import { StoreContext } from "../../store/store-context";

import styles from "../../styles/coffee-store.module.css";

// This code is only run by the server, at the build time. In order to get
// access to info of the page we are trying to pre-render, we can use params prop
export async function getStaticProps(staticProps) {
  const params = staticProps.params;

  const coffeeStores = await fetchCoffeeStores();
  const findCoffeeStoreById = coffeeStores.find(
    (coffeStore) => coffeStore.id === params.id
  );

  return {
    props: {
      coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {},
    },
  };
}

// Here we also need to use getStaticPaths in order to tell to Next.js which dynamic pages
// we want to render. So, Next.js is gonna run first getStaticPaths and will return an array
// of params with the info we want to get from the page (the id, in this case). Then, for each
// element of the array, getStaticProps is gonna be called (above's function) that is going to
// get all the external data (from an API, for instance) of the page with that page.
export async function getStaticPaths() {
  const coffeeStores = await fetchCoffeeStores();

  return {
    paths: coffeeStores.map((coffeStore) => ({
      params: { id: coffeStore.id },
    })),
    // We need to provide "fallback" property to tell Next.js what to pre-render in the case when
    // one of the dynamic pages is not rendered
    fallback: true,
  };
}

const CoffeeStore = (initialProps) => {
  const router = useRouter();

  // If we have set up fallback as true, we'll want to give Next.js some time
  // until page is downloaded and pre-rendered, so a loading status code is a good option.
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  // We get the coffeeStore's id from the route of our individual page
  const id = router.query.id;

  const [coffeeStore, setCoffeeStore] = React.useState(
    initialProps.coffeeStore
  );

  // We check if exists a coffeeStore with this id in the context store
  const {
    state: { coffeeStores },
  } = useContext(StoreContext);

  // In order to use BD with Airtable, we can use it at this point.
  // We just want to save those coffee stores visited by someone, so if that url with the CoffeeStore's is shared,
  // this exists in the app's DB (otherwise it will only exists in the user's context)
  const handleCreateCoffeeStore = async (coffeeStore) => {
    try {
      const { name, voting, imgUrl, id, neighbourhood, address } = coffeeStore;
      const response = await fetch("/api/createCoffeeStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          voting: 0,
          imgUrl,
          neighbourhood: neighbourhood || "",
          address: address || "",
        }),
      });

      const dbCoffeeStore = await response.json();
      console.log({ dbCoffeeStore });
    } catch (err) {
      console.log("Error creating coffee store", err);
    }
  };

  React.useEffect(() => {
    if (isEmpty(coffeeStore)) {
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find(
          (coffeStore) => coffeStore.id.toString() === id
        );

        if (coffeeStoreFromContext) {
          setCoffeeStore(coffeeStoreFromContext);
          handleCreateCoffeeStore(coffeeStoreFromContext);
        }
      }
    } else {
      //SSG
      handleCreateCoffeeStore(coffeeStore);
    }
  }, [id, coffeeStore]);

  const { address, neighbourhood, name, imgUrl } = coffeeStore;

  const [votingCount, setVotingCount] = useState(1);

  const handleUpvoteButton = () => {
    console.log("handle upvote");
    let count = votingCount + 1;
    setVotingCount(count);
  };

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">
              <a>← Back to home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <Image
            src={
              imgUrl ||
              "https://images.unsplash.com/photo-1498804103079-a6351b050096?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2468&q=80"
            }
            width={600}
            height={360}
            className={styles.storeImg}
            alt={name}
          />
        </div>
        <div className={cls("glass", styles.col2)}>
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/places.svg" width="24" height="24" />
            <p className={styles.text}>{address || "No address info"}</p>
          </div>
          {neighbourhood && (
            <div className={styles.iconWrapper}>
              <Image src="/static/icons/nearMe.svg" width="24" height="24" />
              <p className={styles.text}>{neighbourhood}</p>
            </div>
          )}
          <div className={styles.iconWrapper}>
            <Image src="/static/icons/star.svg" width="24" height="24" />
            <p className={styles.text}>{votingCount}</p>
          </div>

          <button className={styles.upvoteButton} onClick={handleUpvoteButton}>
            {" "}
            Up vote!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
