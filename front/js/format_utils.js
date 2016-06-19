(function () {
        function NumberFormatter() {
            
        }
        
        NumberFormatter.prototype.formatMoney = function(moneyAmount) {
            var result = "";
            var trimmed = moneyAmount, negative = false;
            if (trimmed < 0) {
                negative = true;
                trimmed = -trimmed;
            }
            if (trimmed > 1000000) {
                result += Math.floor(trimmed / 1000000) + " ";
            }
            trimmed = trimmed % 1000000;
            result += this._formatThreeDigits(Math.floor(trimmed / 1000)) + " ";
            result += this._formatThreeDigits(Math.floor(trimmed % 1000)) + ".";
            result += this._formatTwoAfterDot(Math.floor(trimmed * 100 % 100));
            result = this._clearZeroes(result);
            if (negative) {
                result = "-" + result;
            }
            return result;
        };

        NumberFormatter.prototype._formatThreeDigits = function(number) {
            return "" + Math.floor(number / 100) + Math.floor(number / 10 % 10) + Math.floor(number % 10);
        };

        NumberFormatter.prototype._formatTwoAfterDot = function(number) {
            return "" + Math.floor(number / 10 % 10) + Math.floor(number % 10);
        };

        NumberFormatter.prototype._clearZeroes = function(srcText) {
            var resultText = srcText;
            while (resultText.length > 4 && (resultText[0] === "0" || resultText[0] === " ")) {
                resultText = resultText.substr(1);
            }
            return resultText;
        };
        
        ru.gizur.apps.NumberFormatter = new NumberFormatter();
        
        function DateFormatter() {
        }
        
        DateFormatter.prototype.monthAndYear = function(monthNo, language) {
            var result = "";
            if (monthNo >= 12) {
                result += Math.floor(monthNo / 12);
                if (language === 'ru') {
                    result += "г";
                }
                else {
                    result += "y";
                }
            }
            if (monthNo % 12 !== 0) {
                result += monthNo % 12;
            }
            return result;
        };

        ru.gizur.apps.dateFormatter = new DateFormatter();
    }()
);