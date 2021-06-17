import cheerio from "cheerio";
import Endpoint from "./endpoint";
import Error from "../responses/error";

const errorMessages = require("../Responses/error_messages.json"),
    responseCodes = require("../Responses/response_codes.json");

class Runes extends Endpoint {
    path() {
        return "/summoner/rune/";
    }

    errorCheck($) {
        if (!$) return false;
        if ($(".ErrorMessage").length) {
            return new Error(errorMessages.NO_RESULTS, responseCodes.NO_RESULTS);
        }
        return false;
    }

    parse($$) {
        var data = [],
            runeTypes = ["mark", "seal", "glyph", "quintessence"],
            runeIndex = -1;

        $$(".RunePageWrap").each((index, item) => {
            var $ = cheerio.load(item),
                runeContainer = {},
                runeType = {};

            runeContainer.title = this.Strip(
                $$(".RunePageList .Button").eq(index).find(".PageName").text()
            );

            $(".RunePageSummaryList .Title, .RunePageSummaryList .Item").each((index1, item1) => {
                var title = runeTypes[runeIndex];

                if (item1.attribs.class.indexOf("Title") > -1) {
                    runeIndex++;
                    runeContainer[runeTypes[runeIndex]] = [];
                    return;
                }

                var $ = cheerio.load(item1),
                    rune = {};

                rune.image = this.Strip($(".Image img").attr("src"));
                rune.name = this.Strip($(".Image img").attr("alt"));
                rune.effect = this.Strip($(".Name").text());
                rune.count = parseInt($(".Count").text().replace("x", ""));
                runeContainer[title].push(rune);
            });
            runeIndex = -1;
            data.push(runeContainer);
        });

        var hasRunes = false;
        for (var runes in data) {
            var rune = data[runes];
            if (
                rune.mark.length ||
                rune.seal.length ||
                rune.glyph.length ||
                rune.quintessence.length
            ) {
                hasRunes = true;
                break;
            }
        }
        return hasRunes ? data : new Error(errorMessages.NO_RESULTS, responseCodes.NO_RESULTS);
    }
}

export default Runes;
