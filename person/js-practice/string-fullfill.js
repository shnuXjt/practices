
const rx_delete_default = /[ < > & % " \\ ]/g;
const rx_syntactic_variable = /\{( [^ { } : \s ]+ )(?: : ( [^ { } : \s ]+ ) )?\}/g
function default_encoder(replacement) {
    return String(replacement).replace(rx_delete_default, "");
}
/**
 * Js 悟道一书中提及的 模版字符串字面量（``）并不安全，合理的方式应是自己实现一个fullfill函数用于实现字符串的替换生成
 * @param string: 需要操作的字符串
 * @param container: 替换的内容
 * @param encoder: 标签函数 用于转义类似<script>这样的特殊问题
 */
function fullfill(string, container, encoder = default_encoder) {
    return string.replace(rx_syntactic_variable, function(original, path, encoding = "") {
        try {
            let replacement = (typeof container === "function" ? container : path.split(".").reduce(function (refinement, element) {
                return refinement[element];
            }, container));

            if (typeof replacement === "function") {
                replacement = replacement(path, encoding);
            }

            replacement = (typeof encoder === "object" ? encoder[encoding] : encoder)(replacement, path, encoding);

            if (typeof replacement === "number" || typeof replacement === "boolean") {
                replacement = String(replacement);
            }

            return (typeof replacement === "string" ? replacement : original);
        } catch(e) {
            return original;
        }
    })
}