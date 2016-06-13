function MortgageMonthCalc(monthNo, amount) {
    var self = this;

    self.monthNo = monthNo;
    self.amount = ko.observable(amount);
    self.percentAmount = ko.observable(0);
    self.monthAmount = ko.observable(0);
    self.toPay = ko.observable(0);

    self.formattedMonth = ko.computed(function() {
        var result = "";
        if (self.monthNo >= 12) {
            result += Math.floor(self.monthNo / 12) + "y";
        }
        if (self.monthNo % 12 !== 0) {
            result += self.monthNo % 12;
        }
        return result;
    });

    self.formattedAmount = ko.computed(function() {
       return ru.gizur.apps.NumberFormatter.formatMoney(self.amount());
    });

    self.formattedPercentAmount = ko.computed(function() {
        return ru.gizur.apps.NumberFormatter.formatMoney(self.percentAmount());
    });

    self.formattedMonthAmount = ko.computed(function() {
        return ru.gizur.apps.NumberFormatter.formatMoney(self.monthAmount());
    });
}

function MortgageVersion(versionName, versionNo) {
    var self = this;
    self.name = ko.observable(versionName);
    self.versionNo = versionNo;
    self.initAmount = ko.observable(0);
    self.desiredAmount = ko.observable(4000000);
    self.monthNumber = 60;
    self.monthsData = ko.observableArray([new MortgageMonthCalc(1, self.desiredAmount() - self.initAmount())]);

    self.addData = function() {
        var newMonth = new MortgageMonthCalc(self.monthsData().length + 1, self.desiredAmount() - self.initAmount())
        if (self.monthsData().length > 0) {
            newMonth.toPay(self.monthsData()[self.monthsData().length - 1].toPay());
        }
        self.monthsData.push(newMonth);
        self.calcPercents();
    };
    self.recalc = function() {
        var monthCount = self.monthsData().length, curAmount = self.desiredAmount() - self.initAmount();
        for (var monthNo = 0; monthNo < monthCount; monthNo++) {
            self.monthsData()[monthNo].amount(curAmount);
            curAmount += (self.monthsData()[monthNo].percentAmount() - self.monthsData()[monthNo].toPay());
        }
    };
    self.calcPercents = function() {
        var monthCount = self.monthsData().length, curAmount = self.desiredAmount() - self.initAmount();
        var dataToSend = {
            initAmount: curAmount,
            monthCount: monthCount,
            totalMonthCount: self.monthNumber
        };
        for (var monthNo = 0; monthNo < monthCount; monthNo++) {
            dataToSend["toPay" + monthNo] = self.monthsData()[monthNo].toPay();
        }
        $.getJSON("http://localhost:8080/mortgage", dataToSend, function(resultJSON) {
            var row;
            for (var monthNo = 0; monthNo < monthCount; monthNo++) {
                row = resultJSON.rows[monthNo];
                self.monthsData()[monthNo].percentAmount(parseInt(row.percentAmount) / 100);
                self.monthsData()[monthNo].monthAmount(parseInt(row.monthAmount) / 100);
            }
            self.recalc();
        });
    };

    self.totalAmount = ko.computed(function() {
        var totalAmount = 0;
        var monthCount = self.monthsData().length;
        for (var monthNo = 0; monthNo < monthCount; monthNo++) {
            totalAmount += parseInt(self.monthsData()[monthNo].toPay());
        }
        return ru.gizur.apps.NumberFormatter.formatMoney(totalAmount);
    });

    self.totalPercentAmount = ko.computed(function() {
        var totalAmount = 0;
        var monthCount = self.monthsData().length;
        for (var monthNo = 0; monthNo < monthCount; monthNo++) {
            totalAmount += self.monthsData()[monthNo].percentAmount();
        }
        return ru.gizur.apps.NumberFormatter.formatMoney(totalAmount);
    });

    self.getVersionId = ko.computed(function() {
        return "#versionTabs-" + self.versionNo;
    });

    self.getVersionTabId = ko.computed(function() {
        return "versionTabs-" + self.versionNo;
    });
}

function MortgageModel() {
    var self = this;
    self.versionCount = 1;
    
    self.versions = ko.observableArray([new MortgageVersion("Version 1", self.versionCount)]);

    self.addNewVersion = function() {
        self.versionCount++;
        var newVersion = new MortgageVersion("Version " + self.versionCount, self.versionCount);
        self.versions.push(newVersion);
        setTimeout(function() {
            $("#versionTabs").tabs("destroy").tabs();
        }, 100);
    };
}

$(document).ready(function() {
    ko.applyBindings(new MortgageModel());
    $("#versionTabs").tabs();
});
