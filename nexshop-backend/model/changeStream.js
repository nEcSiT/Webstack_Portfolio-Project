const Rider = require("./rider");
const Order = require("./order");

function setupChangeStream() {
  const changeStream = Rider.watch();

  changeStream.on("change", async (change) => {
    if (change.operationType === "update" || change.operationType === "replace") {
      const updatedRider = change.fullDocument;
      console.log(`Rider ${updatedRider.name} address updated to ${updatedRider.address}`);

      try {
        const result = await Order.updateMany(
          { "rider._id": updatedRider._id },
          { $set: { "rider.address": updatedRider.address } }
        );

        if (result.nModified > 0) {
          console.log(`Successfully updated ${result.nModified} orders with new rider address`);
        } else {
          console.log(`No orders found with rider _id: ${updatedRider._id}`);
        }
      } catch (error) {
        console.error(`Error updating orders: ${error}`);
      }
    }
  });
}

module.exports = setupChangeStream;
