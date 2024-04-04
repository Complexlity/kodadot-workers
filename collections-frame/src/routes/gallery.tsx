import { Button, Frog } from "frog";
import { getCollection, getCollectionItems, getItem } from "../services/uniquery";
import { kodaUrl } from "../utils";
import { $purifyOne } from "@kodadot1/minipfs";
import { HonoEnv } from "../constants";

export const app = new Frog<HonoEnv>({});

app.frame("/:chain/:id", async (c) => {
  const { chain, id } = c.req.param();

  const collection = await getCollection(chain, id);

  // console.log({collectionItems})
  // console.log({ collection });

  const image = $purifyOne(collection.image, "kodadot_beta");
  const max = collection.max;
  const supply = collection.supply;

  const label = `Browse:${collection.name}${max ? `[${max}]` : ""}`;
  return c.res({
    browserLocation: kodaUrl(chain, id),
    title: collection.name,
    image,
    imageAspectRatio: "1:1",
    intents: [
      <Button action={`/view/${chain}/${id}/1`} value={supply}>
        {label}
      </Button>,
    ],
  });
});

//:curr represents the current item id while :id represents the collection (e.g 106)
app.frame("/view/:chain/:id/:curr", async (c) => {
  let { chain, id, curr } = c.req.param();
  const { buttonValue } = c;


  // There is no max defined
  if (!buttonValue) {
    throw new Error("The collection should have a maximum");
  }
  let max = Number(buttonValue);
  const collectionItems = await getCollectionItems(chain, id);

  let item = collectionItems[Number(curr) - 1]

  if (!item) {
    item = collectionItems[0]
  }

  const image = $purifyOne(item.image, "kodadot_beta");

  const random = max ? Math.floor(Math.random() * max) + 1 : curr + 1;

  

  return c.res({
    image: image,
    imageAspectRatio: "1:1",
    intents: [
      parseInt(curr) > 1 ? (
        <Button
          value={`${max}`}
          action={`/view/${chain}/${id}/${parseInt(curr) - 1}/`}
        >
          {" "}
          ←{" "}
        </Button>
      ) : null,
      <Button
        value={`${max}`}
        action={`/view/${chain}/${id}/${parseInt(curr) + 1}/`}
      >
        {" "}
        →{" "}
      </Button>,

      <Button action={`/view/${chain}/${id}/${random}`} value={`${max}`}>
        {" "}
        ↻{" "}
      </Button>,
      <Button.Link href={kodaUrl(chain, id, curr)}>View</Button.Link>,
    ],
    browserLocation: kodaUrl(chain, id, curr),
  });
});

export default app;
