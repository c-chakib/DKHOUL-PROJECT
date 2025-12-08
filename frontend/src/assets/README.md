# DKHOUL Assets Structure

## Icons (Icons8)

Place your downloaded Icons8 assets here:

```
src/assets/icons/
├── categories/
│   ├── space.png       # For SPACE category services
│   ├── skill.png       # For SKILL category services
│   ├── connect.png     # For CONNECT category services
│   ├── cooking.png     # Cooking experiences
│   ├── adventure.png   # Adventure/outdoor
│   ├── culture.png     # Cultural experiences
│   └── ...
├── ui/
│   ├── search.svg
│   ├── filter.svg
│   └── ...
```

## Lottie Animations

Download Lottie JSON files from [LottieFiles.com](https://lottiefiles.com/) and place them here:

```
src/assets/lottie/
├── success.json        # Success checkmark animation
├── error-desert.json   # Desert/camel for 404 page
├── loading.json        # General loading spinner
├── empty-state.json    # No data found
├── payment.json        # Payment processing
└── ...
```

## Recommended Lottie Animations

- **Success**: <https://lottiefiles.com/animations/success-check>
- **404 Desert**: <https://lottiefiles.com/animations/desert-camel>
- **Loading**: <https://lottiefiles.com/animations/loading-dots>
- **Empty**: <https://lottiefiles.com/animations/empty-box>

## Usage in Components

```html
<!-- Lottie Animation -->
<app-lottie-animation 
    path="assets/lottie/success.json"
    width="200px"
    height="200px">
</app-lottie-animation>

<!-- Category Icon -->
<img [src]="getCategoryIcon('SPACE')" alt="Space">
```
