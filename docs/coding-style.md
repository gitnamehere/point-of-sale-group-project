# Code Style

Standard Coding Style: https://www.cs.drexel.edu/~nkl43/cs375_summer_2023-24/course_site/misc/style/

In addition to the standard coding style for this class above, here are some guidelines/tips and tricks to help keep our project code clean

## Additional helpful guidelines

* use `const` when the variable is a constant or won't be reassigned
* Keep code indentation consistent, at 4 spaces (what we've agreed on)
* Use guard clauses to avoid nested if statements
  * You can also have the if statement be a one-liner like this:

```
if (!condition) return value;
```

* Use ternary operators for simple if/else statements to slim down code

Ex: Instead of:

```
if (variable === value) {
    doTrue();
} else {
    doFalse();
}
```

We can write:


```
variable === value ? doTrue() : doFalse();
```

* Try to use object destructuring when getting data from objects where applicable

Ex:
```
const item = {
    name: "orange",
    quantity: 200
};

const printItem = (obj) => {
    const {name, quantity} = obj;

    console.log(`There are ${quantity} ${name}`);
};

printItem(item);
```

(We may add to this list as this project progresses)
