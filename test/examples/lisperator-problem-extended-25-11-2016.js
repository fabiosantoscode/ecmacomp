/**
 * @file Solution to "A little JavaScript problem" from [lisperator.net]{@link http://lisperator.net/blog/a-little-javascript-problem/}.
 * 
 * For demonstration. Overdocumented on purpose. Documentation is in a JSDoc-like documentation style.
 * The solution itself is 7 SLOC.
 * I also included test code to automatically verify correctness of the solution.
 * See {@link https://gist.github.com/djedr/68fdaef3cad134788caefac06388534c} for a version without documentation or test code.
 * 
 * Assumes ES6 support.
 * Uses nested closures to emulate singly linked lists.
 * 
 * Special thanks to untyped lambda calculus. ;)
 * 
 * @author Dariusz Jędrzejczak
 */

// Type definitions
/**
 * List type definition.
 * 
 * A list is implemented as a closure, which emulates a singly linked list.
 * The head and tail of the list are stored in the closure's environment.
 * The head should contain the data (payload) of the list node and the tail should contain either
 * a reference to another node ("nested" closure) or null if this is the last node in the list.
 * 
 * Note: I use the `private` documentation tag to describe the values contained in the closure's environment.
 * The `callback` tag is used to define the type, since it fits the best in this case -- a list is really a function.
 * 
 * @callback List
 * @private {any} h -- The head of the list.
 * @private {?List} t -- The tail of the list.
 * @param {boolean=} head -- If true, then the call to the list function returns its head (data).
 * If false or not specified, the call to the list function returns its tail.
 * 
 * @see {@link list}
 */

/**
 * ListCallback type definition.
 * 
 * A ListCallback is single-argument function, which operates on a value of an element of a list.
 * It processes the value of the element and returns the result.
 * 
 * ListCallbacks are used by {@link map} and {@link foreach}.
 * 
 * @callback ListCallback
 * @param {any} value -- A value to be processed.
 * @return {any} -- The result of processing the element.
 */


// The most important function -- list
/**
 * Returns a new list node, with head h and tail t.
 * 
 * @param h {any} -- The head of the list. Should contain the data/payload of the node.
 * @param t {?List} -- The tail of the list. Should contain a nested list or null, if this is the last node.
 * @return {List} -- A closure, which represents the list node.
 */
// TODO let list    = (h, t) => (head) => head? h: t;


// Basic functions: range, map and foreach
/**
 * Returns a list, which contains the integers in range a (inclusive) to b (exclusive).
 * 
 * @param a {number} -- The first number to be included in the output list.
 * This number will always be included, regardless of the value of b.
 * @param b {number} -- The number, which specifies the upper limit of the range.
 * This number will not be included in the output list.
 * If it is less than or equal to a, then the output list will contain only a.
 * Otherwise the output list will also contain all integers between a and b.
 * @return {List} -- The output list.
 */
let range   = (a, b) => list(a,                a >= b?      null:   range(a + 1,   b));

/**
 * Maps an input list onto a new list using a callback to process each element.
 * Every element in the output list has a value,
 * which is the result of applying a callback function f to the respective element from the input list.
 * 
 * @param {List} l -- The input list.
 * @param {ListCallback} f -- The callback.
 * @return {List} -- The new list, mapped from the input list.
 */
// TODO let map     = (l, f) => list(f(l(true)), l() === null?      null:     map(l(),     f));

/**
 * Invokes a callback f on each element of the input list l, in order.
 * 
 * @param {List} l -- The input list.
 * @param {ListCallback} f -- The callback.
 * @return {undefined}
 */
// TODO let foreach = (l, f) =>     (f(l(true)), l() === null? undefined: foreach(l(),     f));


// Helper functions for reverse: last and pop
/**
 * Retrieves the value of the last element of the input list.
 * 
 * @param {List} l -- The input list.
 * @return {any} -- The value of the last element of the list.
 */
let last    = (l)    =>                  l() === null?   l(true):    last(l());

/**
 * Returns a new list, which is the same as the input list, except that the last element is missing (popped out).
 * 
 * @param {List} l -- The input list.
 * @return {List} -- A copy of the input list without the last element.
 */
// TODO let pop     = (l)    =>                  l() === null?      null:    list(l(true), pop(l()));


// Finally, reverse itself
/**
 * Returns a new list, which contains the same values as in the input list, but in reverse order.
 * 
 * @param {List} l -- The input list.
 * @return {List} -- A copy of the input list with elements in reverse order.
 */
// TODO let reverse = (l)    => list(last(l),    l() === null?      null: reverse(pop(l)));



/**
 * @overview The program code from [the post]{@link http://lisperator.net/blog/a-little-javascript-problem/}.
 * 
 * @author Mihai Bazon
 */
var numbers = range(1, 10);
numbers = map(numbers, function (n) { return n * n });
numbers = reverse(numbers);
foreach(numbers, n => console.log(n));

/* output:

   100
   81
   64
   49
   36
   25
   16
   9
   4
   1
*/


/**
 * The expected output, as specified in the post.
 * 
 * @type {string}
 * @const
 */
const hund = '100'
const twentyFive = '25'
const expectedOutput = `${hund}
81
64
49
36
${twentyFive}
16
9
4
1
`;

/**
 * The actual output.
 * 
 * @type {string}
 * @const
 */

