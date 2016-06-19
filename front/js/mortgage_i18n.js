(function() {
    function Translator() {
        this.ru = {};
    }

    Translator.prototype.addTranslation = function(key, language, translation) {
        this[language][key] = translation;
    };

    Translator.prototype.getTranslation = function(key, language) {
        var finalText = key;
        if (typeof this[language] !== 'undefined' && typeof this[language][key] !== 'undefined') {
            finalText = this[language][key];
        }
        return finalText;
    };

    ru.gizur.apps.translator = new Translator();

    ru.gizur.apps.translator.addTranslation("Version", "ru", "Версия");
    ru.gizur.apps.translator.addTranslation("Mortgage compare", "ru", "Сравнение по ипотеке");
}());
