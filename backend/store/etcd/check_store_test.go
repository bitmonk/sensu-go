// +build integration,!race

package etcd

import (
	"context"
	"testing"

	"github.com/sensu/sensu-go/backend/store"
	"github.com/sensu/sensu-go/types"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCheckConfigStorage(t *testing.T) {
	testWithEtcd(t, func(store store.Store) {
		check := types.FixtureCheckConfig("check1")
		check.SetExtendedAttributes([]byte(`{"foo":"bar"}`))
		ctx := context.WithValue(context.Background(), types.OrganizationKey, check.Organization)
		ctx = context.WithValue(ctx, types.EnvironmentKey, check.Environment)

		// We should receive an empty slice if no results were found
		checks, err := store.GetCheckConfigs(ctx)
		assert.NoError(t, err)
		assert.NotNil(t, checks)

		err = store.UpdateCheckConfig(ctx, check)
		require.NoError(t, err)

		retrieved, err := store.GetCheckConfigByName(ctx, "check1")
		assert.NoError(t, err)
		require.NotNil(t, retrieved)

		assert.Equal(t, check.Name, retrieved.Name)
		assert.Equal(t, check.Interval, retrieved.Interval)
		assert.Equal(t, check.Subscriptions, retrieved.Subscriptions)
		assert.Equal(t, check.Command, retrieved.Command)
		assert.Equal(t, check.Stdin, retrieved.Stdin)
		ext, err := retrieved.Get("foo")
		require.NoError(t, err)
		assert.Equal(t, "bar", ext)

		checks, err = store.GetCheckConfigs(ctx)
		assert.NoError(t, err)
		assert.NotEmpty(t, checks)
		assert.Equal(t, 1, len(checks))

		// Updating a check in a nonexistent org and env should not work
		check.Organization = "missing"
		check.Environment = "missing"
		err = store.UpdateCheckConfig(ctx, check)
		assert.Error(t, err)
	})
}
