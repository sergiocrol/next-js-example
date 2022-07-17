import { useRouter } from "next/router";
import Link from "next/link";

import coffeeStoreData from "../../data/coffee-stores.json";

// This code is only run by the server, at the build time. In order to get
// access to info of the page we are trying to pre-render, we can use params prop
export function getStaticProps(staticProps) {
  const params = staticProps.params;

  return {
    props: {
      coffeeStore: coffeeStoreData.find(
        (coffeStore) => coffeStore.id === Number(params.id)
      ),
    },
  };
}

// Here we also need to use getStaticPaths in order to tell to Next.js which dynamic pages
// we want to render. So, Next.js is gonna run first getStaticPaths and will return an array
// of params with the info we want to get from the page (the id, in this case). Then, for each
// element of the array, getStaticProps is gonna be called (above's function) that is going to
// get all the external data (from an API, for instance) of the page with that page.
export function getStaticPaths() {
  return {
    paths: coffeeStoreData.map((coffeStore) => ({
      params: { id: coffeStore.id.toString() },
    })),
    // We need to provide "fallback" property to tell Next.js what to pre-render in the case when
    // one of the dynamic pages is not rendered
    fallback: false,
  };
}

const CoffeeStore = (props) => {
  const router = useRouter();

  // If we have set up fallback as true, we'll want to give Next.js some time
  // until page is downloaded and pre-rendered, so a loading status code is a good option.
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      Coffee Store Page {router.query.id}
      <Link href="/">
        <a>Back to home</a>
      </Link>
      <Link href="/coffee-store/45e654">
        <a>Go to page dynamic</a>
      </Link>
      <p>{props.coffeeStore.address}</p>
      <p>{props.coffeeStore.name}</p>
    </div>
  );
};

export default CoffeeStore;
