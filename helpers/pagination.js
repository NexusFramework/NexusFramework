module.exports = function (opts) {
    opts = opts || {};

    var populate = opts.populate || [];
    var perpage = opts.perpage || 10;
    var prefix = opts.prefix || "";
    var select = opts.select;

    var pageParam = prefix + "p";
    return function (req, model, filter, cb) {
        if (!cb) {
            cb = filter;
            filter = {};
        }

        model.count(filter, function (err, count) {
            if (err)
                return cb(err);

            var query = model.find(filter);
            if (select)
                query.select(select);

            var page = req.query[pageParam] * 1;
            if (isNaN(page))
                page = 0;
            else
                query.skip(page * perpage);
            query.limit(perpage);

            process.domain.logger.info("Populating", opts);
            populate.forEach(function (what) {

                query.populate(what);
            })

            query.exec(function (err, results) {
                if (err)
                    return cb(err);

                var ret = {
                    results: results,
                    total: Math.ceil(count / perpage),
                    index: page
                };

                if (ret.total > 1) {
                    var url = req.originalUrl;
                    var i = url.indexOf("?");
                    if (i > -1)
                        url = url.substring(0, i);

                    url += "?";
                    var params = Object.keys(req.query);
                    if (params.length > 0) {

                        var first = true;
                        params.forEach(function (param) {
                            if (param == pageParam)
                                return;

                            if (first)
                                first = false;
                            else
                                url += "&";
                            url += urlencode(param);
                            url += "=";
                            url += urlencode(req.query[param]);
                        });
                        if (!first)
                            url += "&";

                    }

                    url += pageParam;
                    url += "=";

                    if (page > 0)
                        ret.prev = url + (page - 1);
                    else
                        ret.prev = false;
                    if (page < count - 1)
                        ret.next = url + (page + 1);
                    else
                        ret.next = false;

                }
                cb(null, ret);
            });
        });
    };
}
