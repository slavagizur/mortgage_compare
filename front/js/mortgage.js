var mortgageAppInit = function() {};

(function() {
    function MortgageMonthCalc(monthNo, amount, language) {
        var self = this;

        self.monthNo = monthNo;
        self.amount = ko.observable(amount);
        self.percentAmount = ko.observable(0);
        self.monthAmount = ko.observable(0);
        self.toPay = ko.observable(0);

        self.formattedMonth = ko.computed(function () {
            return ru.gizur.apps.dateFormatter.monthAndYear(self.monthNo, language);
        });

        self.formattedAmount = ko.computed(function () {
            return ru.gizur.apps.NumberFormatter.formatMoney(self.amount());
        });

        self.formattedPercentAmount = ko.computed(function () {
            return ru.gizur.apps.NumberFormatter.formatMoney(self.percentAmount());
        });

        self.formattedMonthAmount = ko.computed(function () {
            return ru.gizur.apps.NumberFormatter.formatMoney(self.monthAmount());
        });
    }

    function MortgageVersion(versionName, versionNo, language) {
        var self = this;
        self.name = ko.observable(versionName);
        self.versionNo = versionNo;
        self.initAmount = ko.observable(0);
        self.desiredAmount = ko.observable(4000000);
        self.monthNumber = 60;

        self._initAmount = ko.computed(function() {
            return self.desiredAmount() - self.initAmount();
        });

        self.monthsData = ko.observableArray([new MortgageMonthCalc(1, self._initAmount(), language)]);

        self.addData = function () {
            var newMonth = new MortgageMonthCalc(self.monthsData().length + 1, self._initAmount(), language)
            if (self.monthsData().length > 0) {
                newMonth.toPay(self.monthsData()[self.monthsData().length - 1].toPay());
            }
            self.monthsData.push(newMonth);
            self.calcPercents();
        };
        self.recalc = function () {
            var monthCount = self.monthsData().length, curAmount = self._initAmount();
            for (var monthNo = 0; monthNo < monthCount; monthNo++) {
                self.monthsData()[monthNo].amount(curAmount);
                curAmount += (self.monthsData()[monthNo].percentAmount() - self.monthsData()[monthNo].toPay());
            }
        };
        self.calcPercents = function () {
            var monthCount = self.monthsData().length, curAmount = self._initAmount();
            var dataToSend = {
                initAmount: curAmount,
                monthCount: monthCount,
                totalMonthCount: self.monthNumber
            };
            for (var monthNo = 0; monthNo < monthCount; monthNo++) {
                dataToSend["toPay" + monthNo] = self.monthsData()[monthNo].toPay();
            }
            $.getJSON("http://localhost:8080/mortgage", dataToSend, function (resultJSON) {
                var row;
                for (var monthNo = 0; monthNo < monthCount; monthNo++) {
                    row = resultJSON.rows[monthNo];
                    self.monthsData()[monthNo].percentAmount(parseInt(row.percentAmount) / 100);
                    self.monthsData()[monthNo].monthAmount(parseInt(row.monthAmount) / 100);
                }
                self.recalc();
            });
        };

        self.totalAmount = ko.computed(function () {
            var totalAmount = 0;
            var monthCount = self.monthsData().length;
            for (var monthNo = 0; monthNo < monthCount; monthNo++) {
                totalAmount += parseInt(self.monthsData()[monthNo].toPay());
            }
            return ru.gizur.apps.NumberFormatter.formatMoney(totalAmount);
        });

        self.totalPercentAmount = ko.computed(function () {
            var totalAmount = 0;
            var monthCount = self.monthsData().length;
            for (var monthNo = 0; monthNo < monthCount; monthNo++) {
                totalAmount += self.monthsData()[monthNo].percentAmount();
            }
            return ru.gizur.apps.NumberFormatter.formatMoney(totalAmount);
        });

        self.getVersionId = ko.computed(function () {
            return "#versionTabs-" + self.versionNo;
        });

        self.getVersionTabId = ko.computed(function () {
            return "versionTabs-" + self.versionNo;
        });
    }

    function MortgageModel(language) {
        var self = this;
        self.versionCount = 0;
        self.language = language;
        var translator = ru.gizur.apps.translator;

        self.versions = ko.observableArray([]);

        self.addNewVersion = function () {
            self.versionCount++;
            var newVersion = new MortgageVersion(translator.getTranslation("Version", self.language) + " " + self.versionCount, self.versionCount, language);
            self.versions.push(newVersion);
            setTimeout(function () {
                $("#versionTabs").tabs("destroy").tabs();
            }, 100);
        };

        self.addNewVersion();
    }

    mortgageAppInit = function AppInit() {
        var self = this;

        this._load = function(language) {
            var realLanguage = language, languageSuffix;
            if (typeof realLanguage === 'undefined' || realLanguage.length === 0 || realLanguage === 'en') {
                realLanguage = "en";
                languageSuffix = "";
            }
            else {
                realLanguage = language;
                languageSuffix = "_" + language;
            }
            document.title = ru.gizur.apps.translator.getTranslation("Mortgage compare", realLanguage);
            var templates = ["language", "versions", "main"];
            ru.gizur.apps.templates.load(templates, languageSuffix, function(templateResult) {
                var wholeHtml = "";
                for (var no = 0; no < templateResult.length; no++) {
                    wholeHtml += templateResult[no];
                }
                $(document).find("body").html(wholeHtml);
                ko.applyBindings(new MortgageModel(realLanguage));
                $("#versionTabs").tabs();

                $(".languageSwitcher").on("click", function(event) {
                    event.stopPropagation();
                    window.location.href = $(this).attr("href");
                    var $element = $(document).find("body");
                    ko.cleanNode($element[0]);
                    self._load(window.location.hash.substr(1));
                });
            });
        };

        $(document).ready(function () {
            self._load(window.location.hash.substr(1));
        });
    }
})();