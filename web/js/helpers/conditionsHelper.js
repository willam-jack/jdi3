var ConditionsHelper = (function () {
    function getOperators(mode, type) {
        var result = null;
        if (mode === 1) {//适用于数据库查询配置等
            result = [
                {name: "等于", value: "="},
                {name: "不等于", value: "<>"},
                {name: "模糊匹配", value: "like"},
                {name: "大于", value: ">"},
                {name: "大于等于", value: ">="},
                {name: "小于", value: "<"},
                {name: "小于等于", value: "<="}
            ];
            if (type === "String") {
                result = [
                    {name: "等于", value: "="},
                    {name: "不等于", value: "<>"},
                    {name: "模糊匹配", value: "like"}
                ];
            } else if (type === "Number") {
                result = [
                    {name: "等于", value: "="},
                    {name: "不等于", value: "<>"},
                    {name: "大于", value: ">"},
                    {name: "大于等于", value: ">="},
                    {name: "小于", value: "<"},
                    {name: "小于等于", value: "<="}
                ];
            }
        } else if (mode === 2) {//适用于触发条件配置等
            result = [
                {name: "等于", value: "==="},
                {name: "不等于", value: "!=="},
                {name: "大于", value: ">"},
                {name: "大于等于", value: ">="},
                {name: "小于", value: "<"},
                {name: "小于等于", value: "<="}
            ];
            if (type === "String") {
                result = [
                    {name: "等于", value: "==="},
                    {name: "不等于", value: "!=="}
                ];
            } else if (type === "Number") {
                result = [
                    {name: "等于", value: "==="},
                    {name: "不等于", value: "!=="},
                    {name: "大于", value: ">"},
                    {name: "大于等于", value: ">="},
                    {name: "小于", value: "<"},
                    {name: "小于等于", value: "<="}
                ];
            }
        } else if (mode === 3) {//适用于抄送值配置等
            result = [
                {name: "赋值", value: "="},
                {name: "自增", value: "+"},
                {name: "自减", value: "-"},
                {name: "自乘", value: "*"},
                {name: "自除", value: "/"}
            ];
            if (type === "String") {
                result = [
                    {name: "赋值", value: "="},
                    {name: "连接", value: "+"}
                ];
            } else if (type === "Number") {
                result = [
                    {name: "赋值", value: "="},
                    {name: "自增", value: "+"},
                    {name: "自减", value: "-"},
                    {name: "自乘", value: "*"},
                    {name: "自除", value: "/"}
                ];
            }
        }
        return result;
    }

    return {
        typeConfig: [
            {name: "字符串", value: "String"},
            {name: "数字", value: "Number"},
            {name: "元素", value: "Element"},
            {name: "查询字符串", value: "QueryString"}
        ],
        getOperators: getOperators
    };
})();