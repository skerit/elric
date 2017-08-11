# Elric
A home automation system built in node.js


## What is this?

In my search for suitable home automation software I couldn't find anything that pleased me.

So, naturally, I started writing it myself.

Elric is meant to be a very extensible piece of software.

Though, right now, it can't do much.

## Notes

The client and server use UDP to discover each other, if you're running UFW you need to allow this traffic:

```
sudo ufw allow in proto udp to 224.0.0.0/4
sudo ufw allow in proto udp from 224.0.0.0/4
```