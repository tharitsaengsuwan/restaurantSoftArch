const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var amqp = require("amqplib/callback_api");

app.post("/placeorder", (req, res) => {
  const orderItem = {
    name: req.body.name,
    price: req.body.price,
    type: req.body.type,
  };

  amqp.connect("amqp://localhost", function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      var exchange = "direct_logs";
    //   var args = process.argv.slice(2);
    //   var msg = args.slice(1).join(" ") || "Hello World!";
    //   var severity = args.length > 0 ? args[0] : "info";

      channel.assertExchange(exchange, "direct", {
        durable: false,
      });
      channel.publish(exchange, orderItem['type'], Buffer.from(JSON.stringify(orderItem)));
      console.log(" [x] Sent %s: '%s'", orderItem['type'], JSON.stringify(orderItem));
    });

    // setTimeout(function () {
    //   connection.close();
    //   process.exit(0);
    // }, 500);
    return res.status(200).json(orderItem);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at port %d", PORT);
});
