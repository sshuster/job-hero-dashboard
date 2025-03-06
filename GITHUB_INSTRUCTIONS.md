
# How to Push This Project to GitHub

Follow these steps to push your JobHero project to GitHub:

## 1. Create a New Repository on GitHub

1. Go to [GitHub](https://github.com/) and sign in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Enter a name for your repository (e.g., "jobhero")
4. Add a description (optional)
5. Choose if you want the repository to be public or private
6. Click "Create repository"

## 2. Initialize Git in Your Project (if not already done)

```bash
git init
```

## 3. Add Your Files to Git

```bash
git add .
```

## 4. Commit Your Files

```bash
git commit -m "Initial commit"
```

## 5. Add GitHub as a Remote

Replace `<username>` with your GitHub username and `<repository>` with your repository name:

```bash
git remote add origin https://github.com/<username>/<repository>.git
```

## 6. Push Your Code to GitHub

```bash
git push -u origin main
```

Note: If your default branch is named "master" instead of "main", use:

```bash
git push -u origin master
```

## 7. Verify Your Code is on GitHub

Go to your GitHub repository page to confirm that your code has been successfully pushed.
