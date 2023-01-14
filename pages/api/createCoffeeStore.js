import {
  table,
  getMinifiedRecords,
  findRecordByFilter,
} from "../../lib/airtable";

const createCoffeeStore = async (req, res) => {
  if (req.method !== "POST") {
    return res.json({ message: "Not allowed method" });
  }

  const { id, name, neighbourhood, address, imgUrl, voting } = req.body;

  try {
    if (id) {
      const records = await findRecordByFilter(id);
      if (records.length !== 0) {
        // If we already have the coffee store in the database, we just return it
        return res.json(records);
      } else {
        // Otherwise we create the store and we return it.
        if (id && name) {
          const createRecords = await table.create([
            {
              fields: {
                id,
                name,
                address,
                neighbourhood,
                voting,
                imgUrl,
              },
            },
          ]);

          const records = getMinifiedRecords(createRecords);
          res.status(201).json({ records });
        } else {
          res.status(400).json({ message: "Id or name fields are missing" });
        }
      }
    } else {
      res.status(400).json({ message: "Id is missing" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error creating or finding a store", err });
  }
};

export default createCoffeeStore;
