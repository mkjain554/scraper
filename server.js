var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var app = express();

app.get('/scrape', function (req, res) {
    // Let's scrape Anchorman 2
    url = 'https://www.naatp.org/facility/';
    var dataArr = [];
    var pagination;
    populatePagination(url);
    //populateData();


    function populatePagination(url) {
        request(url, function (error, response, html) {
            if (!error) {
                var $ = cheerio.load(html);
                var pagination = $("body").find(".page_info").html().split("of")[1];
                pagination = Number(pagination);
                if (pagination && pagination > 0) {
                    var urls = [];
                    for (var i = 1; i <= 1; i++) {
                        urls.push('https://www.naatp.org/facility/page/' + i + '/');
                    }
                    async.eachSeries(urls, function iterator(item, callback) {
                        console.log("url..." + item);
                        populateData(item, callback);
                    }, function done() {
                        console.log("after reading all the urls");
                        res.send('Check your console!');
                        populateDataOfEachLink();
                    });
                }
            }
        });

    }

    function populateDataOfEachLink() {
        async.eachSeries(dataArr, function iterator(item, callback) {
            console.log("dataarr.." + item.href);
            request(item.href, function (error, response, html) {
                if (error) {
                    console.log("error in reading more info");
                    callback();
                } else {
                    var $ = cheerio.load(html);
                    var body = $('body').find(".facility-meta-box");
                    $(body).find("dl").each(function (index) {
                        if (index == 4) {
                            $(this).find("dd").each(function () {
                                $(this).find("div").each(function () {
                                    item.ceoContact = item.ceoContact || {};
                                    item.ceoContact.email = $(this).find("a").text();
                                    var html = $(this).html() || '';
                                    var info = html.split("<br>");
                                    item.ceoContact.name = info[0] ? info[0].split("</em>")[1] : '';
                                    item.ceoContact.phone = info[2] ? info[2].split("</em>")[1] : '';
                                    item.ceoContact.fax = info[3] ? info[3].split("</em>")[1] : '';
                                });
                            })
                        }
                        if (index == 5) {
                            $(this).find("dd").each(function () {
                                $(this).find("div").each(function () {
                                    item.admissionContact = item.admissionContact || {};
                                    item.admissionContact.email = $(this).find("a").text();
                                    var html = $(this).html() || '';
                                    var info = html.split("<br>");
                                    item.admissionContact.name = info[0] ? info[0].split("</em>")[1] : '';
                                    item.admissionContact.phone = info[2] ? info[2].split("</em>")[1] : '';
                                    item.admissionContact.fax = info[3] ? info[3].split("</em>")[1] : '';
                                });
                            })
                        }
                        if (index == 6) {
                            $(this).find("dd").each(function () {
                                $(this).find("div").each(function () {
                                    item.markettingContact = item.markettingContact || {};
                                    item.markettingContact.email = $(this).find("a").text();
                                    var html = $(this).html() || '';
                                    var info = html.split("<br>");
                                    item.markettingContact.name = info[0] ? info[0].split("</em>")[1] : '';
                                    item.markettingContact.phone = info[3] ? info[2].split("</em>")[1] : '';
                                    item.markettingContact.fax = info[3] ? info[3].split("</em>")[1] : '';
                                });
                            })
                        }
                    })
                    callback();
                }
            });
        }, function done() {
            fs.writeFile('output.json', JSON.stringify(dataArr, null, 4), function (err) {
                console.log('File successfully written! - Check your project directory for the output.json file');
            })

        });
    }

    function populateData(url, callback) {
        request(url, function (error, response, html) {
            if (error) {
                console.log("error in reading.." + error);
                callback();
            } else {
                var $ = cheerio.load(html);
                var body = $('body').find(".facility-list > tr");
                $(body).each(function (index) {
                    var json = {
                        name: "",
                        address: "",
                        href: ""
                    };
                    $(this).find("td").each(function (index1) {
                        if (index1 == 0) {
                            json.name = $(this).find("a").text();
                            json.address = $(this).find("div").text();

                        }
                        if (index1 == 1) {
                            var href = $(this).find("a").attr("href");
                            json.href = href;
                        }
                    });
                    dataArr.push(json);
                });
                callback();
            }
        });
    }


    /*function populateData() {
        if (pagination && pagination > 0) {
            for (var i = 2; i <= pagination; i++) {
                var url = 'https://www.naatp.org/facility/page/' + i + '/';

            }
        }
    }


    request(url, function (error, response, html) {
        //console.log(html);
        if (!error) {
            var $ = cheerio.load(html);



            var body = $('body').find(".facility-list > tr");
            $(body).each(function (index) {
                var json = {
                    name: "",
                    address: "",
                    href: ""
                };

                $(this).find("td").each(function (index1) {
                    if (index1 == 0) {
                        json.name = $(this).find("a").text();
                        json.address = $(this).find("div").text();

                    }

                    if (index1 == 1) {
                        var href = $(this).find("a").attr("href");
                        json.href = href;
                    }
                });


                dataArr.push(json);
            });

            var pagination = $("body").find(".page_info").html().split("of")[1];
            pagination = Number(pagination);
        }




    })*/

})

app.listen('9999')
console.log('Magic happens on port 9999');
exports = module.exports = app;
