const shitCoinGrabBag = artifacts.require('./ExposedShitCoinGrabBag');
const AbortHelper = require('./AbortHelper');

contract('ShitCoinGrabBag', function(accounts) {
  let shitCoinGrabBagInstance;
  const owner    = accounts[0];
  const nonOwner = accounts[1];
  const contractAccount = accounts[2];

  beforeEach(async () => {
    shitCoinGrabBagInstance = await shitCoinGrabBag.new({from: owner});
  });

  describe("toggleContract", () => {
    describe("non owner", () => {
      it("reverts", async () => {
        await AbortHelper.tryCatch(shitCoinGrabBagInstance.toggleContract({from: nonOwner}), "revert");
      });
    })
    describe("owner", () => {
      it("toggles state", async () => {
        expect(shitCoinGrabBagInstance.halt === false, "contract starts in runner state");
        await shitCoinGrabBagInstance.toggleContract({from: owner});
        expect(shitCoinGrabBagInstance.halt === true, "toggle to halted");
        await shitCoinGrabBagInstance.toggleContract({from: owner});
        expect(shitCoinGrabBagInstance.halt === false, "toggles back to not");
      });
    });
  });

  describe("deleteTokenContract", async () => {
    it("throws when empty", async () => {
      await AbortHelper.tryCatch(shitCoinGrabBagInstance._deleteTokenContract(0), "revert");
    });

    describe("with 1 element", async () => {
      beforeEach(async () => {
        await shitCoinGrabBagInstance.registerToken("0x0139f72d20b29fa0dca007192c9834496d7770a9", 1, {from: owner});
      });

      it("throws on invalid index", async () => {
        await AbortHelper.tryCatch(shitCoinGrabBagInstance._deleteTokenContract(2), "revert");
      });

      it("works with 0", async () => {
        let keys = await shitCoinGrabBagInstance.getTokenContracts();
        assert.equal(keys.length, 1, "starts with 1");
        shitCoinGrabBagInstance._deleteTokenContract(0);
        keys = await shitCoinGrabBagInstance.getTokenContracts();
        assert.equal(keys.length, 0, "now zero");
      });
    });

    describe("with 2 elements", async () => {
      beforeEach(async () => {
        await shitCoinGrabBagInstance.registerToken("0x0139f72d20b29fa0dca007192c9834496d7770a1", 1, {from: owner});
        await shitCoinGrabBagInstance.registerToken("0x0139f72d20b29fa0dca007192c9834496d7770a2", 1, {from: owner});
      });

      it("removes 1st element", async () => {
        let keys = await shitCoinGrabBagInstance.getTokenContracts();
        assert.equal(keys.length, 2, "starts with 2");
        await shitCoinGrabBagInstance._deleteTokenContract(0);
        
        keys = await shitCoinGrabBagInstance.getTokenContracts();

        assert.equal(keys.length, 1, "one left");
        assert.equal(keys[0], "0x0139f72d20b29fa0dca007192c9834496d7770a2", "correct element still exists");
      });

      it("removes 2nd element", async () => {
        let keys = await shitCoinGrabBagInstance.getTokenContracts();
        assert.equal(keys.length, 2, "starts with 2");
        await shitCoinGrabBagInstance._deleteTokenContract(1);
        
        keys = await shitCoinGrabBagInstance.getTokenContracts();

        assert.equal(keys.length, 1, "one left");
        assert.equal(keys[0], "0x0139f72d20b29fa0dca007192c9834496d7770a1", "correct element still exists");
      });
    });
  });
});
