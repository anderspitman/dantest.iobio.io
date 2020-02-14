echo "** Copy files **"
# Don't copy samtools.wasm by default because it requires manually setting the content type
aws s3 cp ./ s3://static.iobio.io/prod/qual.iobio.io/ --acl public-read --recursive --exclude '.git/*' --exclude 'samtools.wasm' --cache-control 'public, max-age=600'
echo "** Renew cloudfrount cache **"
aws cloudfront create-invalidation --distribution-id E1HZ1TZPG9TISW --paths /\*
