echo "** Copy files **"
aws s3 cp ./ s3://static.iobio.io/prod/dantest.iobio.io/ --recursive --cache-control 'public, max-age=600'
echo "** Renew cloudfrount cache **"
aws cloudfront create-invalidation --distribution-id E1HZ1TZPG9TISW --paths /\*
