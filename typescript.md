# TypeScript Cheatsheet

## Variables & constants

C
```c
int a;
int b = 42;
#define C 42
```

TS
```ts
let a: number;
let b = 42; // type inference
const c = 42; // mostly do this
```

## Printing

C
```c
#include <stdio.h>

printf("%d\n", 42);
printf("%s\n", "foo");
```

TS
```ts
console.log(42);
console.log("foo");
```

## Types

### Numbers

C
```c
int a;
float b;
// ...

a = 42;
b = 4.2;
```

TS
```ts
let a: number;

a = 42;
a = 4.2;
```

### Strings

C
```c
char a;
char *b;

a = 'f';
b = "foo";
```

TS
```ts
let a: string;

a = 'f';
a = "f";
a = 'foo';
a = "foo";
```

C
```c
char *a = "foo";
strlen(a); // 3
```

TS
```ts
let a = "foo";
a.length; // 3
```

### Template strings

C
```c
#include <stdio.h>

int a = 49;
printf("I love %d\n", a);
```

TS
```ts
let a = 49;
console.log(`I love ${a}`);

// not for only printing
b = `I love ${a}`;
```

### Booleans

C
```c
#include <stdbool.h>
bool a = true;
```

TS
```ts
let a: boolean = true;
let b = true; // type inference
```

## Conditionals

C
```c
if (1 + 1 == 2) {
	// ...
}
```

TS
```ts
// bad
if (1 + 1 == 2) {
	// ...
}

// good (does type check)
if (1 + 1 === 2) {
	// ...
}
```

C
```c
int a = 1;
int b = 2;
int max = a > b ? a : b; // 2
```

TS
```ts
let a = 1;
let b = 2;
let max = a > b ? a : b; // 2
```

## Functions

C
```c
int triple(int n) {
	return n * 3;
}
```

TS
```ts
const triple1 = (n: number): number => {
	return n * 3;
}

// type inference
const triple2 = (n: number) => {
	return n * 3;
}

// only for single-line functions
const triple3 = (n: number) => n * 3;
```

## More types

### Type aliases

C
```c
typedef int MyType;
MyType a;
```

TS
```ts
type MyType = number;
let a: MyType;
```

### Objects

C
```c
struct Course {
	char *name;
	int students;
}

Course cs1511 = {
	"Programming Fundamentals",
	893
};
```

TS
```ts
type Course = {
	name: string;
	students: number;
}

// could also use type inference
let cs1511: Course = {
	name: "Programming Fundamentals",
	students: 893
}
```

### Arrays

C
```c
int a[3] = {1, 2, 3};
a[42] = 4; // segmentation fault
```

TS
```ts
let a: number[] = [1, 2, 3];
a[42] = 4;
a; // [1, 2, 3, 4]
```

### Union types

TS
```ts
let a: number | string;
a = 42;
a = "foo";

let b = "foo" | "bar";
b = "foo";
b = "bar";
b = "baz"; // compile error
```

### Undefined & null

TS
```ts
let a: number;
console.log(a); // undefined

let b: number | null;
b = 42;
b = null; // the "nothing" type
```
